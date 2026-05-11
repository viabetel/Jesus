import { notFound } from "next/navigation"
import { getProductById } from "@/lib/services/products-repo"
import { ProductForm } from "../product-form"

type Props = { params: Promise<{ id: string }> }

export const dynamic = "force-dynamic"

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()
  return <ProductForm initial={product} />
}
