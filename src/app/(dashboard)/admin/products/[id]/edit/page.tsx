import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/product/product-form";
import type { Product } from "@/types/database";
import { getDashboardTranslator } from "@/i18n/server";

export default async function AdminEditProductPage({ params }: { params: { id: string } }) {
    const { t } = await getDashboardTranslator();
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: product, error } = (await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single()) as { data: Product | null; error: unknown };

    if (error || !product) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-navy">{t("admin.products.editTitle")}</h1>
                <p className="text-sm text-muted-foreground">{t("admin.products.editSubtitle")}</p>
            </div>

            <ProductForm
                mode="edit"
                initialData={product}
                submitEndpoint={`/api/admin/products/${product.id}`}
                redirectPath="/admin/products"
            />
        </div>
    );
}
