"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardQuickAdd() {
  const handleClick = () => {
    console.log("Quick Add clicked")
    alert("Quick Add menu would open here")
  }

  return (
    <Button className="w-fit" onClick={handleClick}>
      <Plus className="h-4 w-4 mr-2" />
      Quick Add
    </Button>
  )
}
