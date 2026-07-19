import { Suspense } from "react";
import ShopSearch from "@/components/ShopSearch";

// Shop directory/search lives in the MiBarbero app shell — it's a MiBarbero
// surface. Individual shop pages (/shop/[shopId]) use the front-door layout.
export default function ShopSearchPage() {
  return (
    // Suspense boundary required because ShopSearch reads useSearchParams.
    <Suspense>
      <ShopSearch />
    </Suspense>
  );
}
