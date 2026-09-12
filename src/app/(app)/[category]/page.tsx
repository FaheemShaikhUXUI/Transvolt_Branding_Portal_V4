"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { useAssets } from "@/lib/assets/assets-context"
import { AssetPage } from "@/components/assets/asset-page"

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = React.use(params)
  const { getCategoryConfig } = useAssets()
  const config = getCategoryConfig(resolvedParams.category)
  
  if (!config) {
    notFound()
  }

  return <AssetPage config={config} />
}
