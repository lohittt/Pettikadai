import { useState, useEffect } from 'react';
import { PettikadaiAPI } from '../../api/pettikadaiApi';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export function UserMonitor() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        PettikadaiAPI.getAdminUsers()
            .then((res) => {
                if (res?.success && Array.isArray(res.users)) {
                    setUsers(res.users);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="container min-h-[60vh] py-12">
            <div className="mb-8">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    User Management
                </p>
                <h2 className="text-3xl font-bold tracking-tight">Registered Users ({users.length})</h2>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">Loading users...</p>
                    ) : users.length === 0 ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">No registered users found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`rounded-full uppercase ${
                                                    u.role === 'admin'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'border border-border bg-surface-container text-foreground'
                                                }`}
                                            >
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {u.created_at
                                                ? new Date(u.created_at).toLocaleDateString('en-IN')
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
