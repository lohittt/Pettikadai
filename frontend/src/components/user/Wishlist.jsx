import { Heart, X } from 'lucide-react';
import { formatINR } from '../../utils/format';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

export function Wishlist({ wishlist, productMap, isOpen, onClose, onRemove }) {
    const items = wishlist.map((id) => productMap.get(id)).filter(Boolean);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl" id="wishlist-modal">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        My Wishlist <Heart className="size-5 fill-red-500 text-red-500" />
                    </DialogTitle>
                    <DialogDescription>Your favourite products in one place.</DialogDescription>
                </DialogHeader>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                        <Heart className="size-10 text-red-500" />
                        <h3 className="text-lg font-semibold">Your wishlist is empty!</h3>
                        <p className="text-sm text-muted-foreground">
                            Add products you love to your wishlist.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y">
                        {items.map((product) => (
                            <div
                                className="flex items-center gap-4 py-4"
                                key={product.id}
                                data-product-id={product.id}
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="size-16 rounded-md bg-muted object-contain"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                                    <strong className="text-sm text-red-600">{formatINR(product.price)}</strong>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Remove from wishlist"
                                    onClick={() => onRemove(product.id)}
                                >
                                    <X />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
