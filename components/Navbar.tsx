"use client"
import { cn } from "@/lib/utils"
import { BookAIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

const navItems = [
    {label: "Library", href: "/"},
    {label: "Add New", href: "/books/new"}
]

const Navbar = ({ children }: { children?: ReactNode }) => {
    const pathName = usePathname()
  return (
    <header className="fixed z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
        <div className="wrapper flex min-h-[var(--navbar-height)] flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3 sm:flex-nowrap">
            <Link href={"/"} className="flex shrink-0 gap-0.5 items-center" >
            <BookAIcon width={42} height={26} />
            <span>BookExpress</span>
            </Link>
            <nav className="order-3 flex w-full items-center justify-center gap-5 text-sm sm:order-2 sm:w-fit sm:justify-start sm:text-base">
                {navItems.map(({label, href}) => {
                    const isActive = pathName === href || (href !== "/" && pathName.startsWith(href))
                    return (
                        <Link href={href} key={label} className={cn('nav-link-base',
                            isActive ? 'nav-link-active' : 'text-black hover:opacity-70'
                        )}>
                            {label}
                        </Link>
                    )
                })}
            </nav>
            <div className="order-2 flex items-center justify-end gap-2 sm:order-3 sm:gap-3">
                {children}
            </div>
        </div>
    </header>
  )
}

export default Navbar
