import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Tags } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const ServiceTypeManager = () => {
    const { serviceTypes, addServiceType, removeServiceType } = useAppStore();
    const [newType, setNewType] = useState('');

    const handleAdd = () => {
        if (newType.trim()) {
            addServiceType(newType.trim());
            setNewType('');
        }
    };

    return (
        <Card className="glass-card w-full border-sky-400/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-cyan-300">
                    <Tags className="w-4 h-4" />
                    Categorias O.S
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="Nova Categoria..."
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                        className="h-8 text-xs bg-slate-950/50 border-sky-400/20 focus:border-cyan-400/60"
                    />
                    <Button onClick={handleAdd} size="icon" className="h-8 w-8 shrink-0 noc-cta rounded-lg">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                    {serviceTypes.map((type) => (
                        <div
                            key={type.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-950/45 border border-sky-400/10 hover:border-cyan-400/30 hover:bg-slate-900/60 group transition-colors"
                        >
                            <span className="text-xs font-medium text-sky-100">{type.name}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeServiceType(type.id)}
                                title="Remover categoria"
                                className="h-6 w-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}
                    {serviceTypes.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                            Nenhuma categoria cadastrada via gerenciador.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
