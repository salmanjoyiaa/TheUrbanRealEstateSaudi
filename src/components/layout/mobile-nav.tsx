"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { publicNavKeys } from "@/config/nav";
import { useLocale } from "@/providers/locale-provider";

export function MobileNav() {
    const { t } = useLocale();
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-foreground hover:bg-foreground/5" aria-label="Open navigation menu">
                        <Menu className="h-6 w-6 stroke-[2.5]" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-sm border-r border-border bg-background p-6">
                    <SheetHeader>
                        <SheetTitle className="border-b border-border py-4 text-left">
                            <span className="text-[20px] font-black leading-none tracking-tight text-foreground">
                                TheUrbanRealEstateSaudi
                            </span>
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="mt-8 flex flex-col gap-2 px-2" aria-label="Mobile navigation">
                        {publicNavKeys.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="rounded-xl px-4 py-3.5 text-[16px] font-bold tracking-wide text-foreground transition-all hover:bg-foreground/5 active:scale-95"
                            >
                                {t(link.titleKey)}
                            </Link>
                        ))}

                        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
                            <Link
                                href="/login?type=property"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-[15px] font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
                            >
                                {t("nav.aqariLogin")}
                            </Link>
                            <Link
                                href="/login?type=visiting"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center justify-center rounded-xl border-2 border-primary px-4 py-3.5 text-[15px] font-bold text-primary shadow-sm transition-all hover:bg-primary/5 active:scale-95"
                            >
                                {t("nav.teamLogin")}
                            </Link>
                            <Link
                                href="/login?type=maintenance"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center justify-center rounded-xl border-2 border-primary px-4 py-3.5 text-[15px] font-bold text-primary shadow-sm transition-all hover:bg-primary/5 active:scale-95"
                            >
                                {t("nav.maintenanceLogin")}
                            </Link>
                        </div>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    );
}
