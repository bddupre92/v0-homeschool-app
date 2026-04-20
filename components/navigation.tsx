"use client"

/**
 * App navigation — unified calm shell.
 * Renders the AtoZ Topbar + PhoneBottomNav + Log-hours FAB on every
 * authenticated calm room. Returns null on chromeless routes (public
 * landing, auth pages, full-screen teach mode).
 */

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  LogOut,
  User as UserIcon,
  Settings,
  Plus,
  Home,
  Presentation,
  Heart,
  Users,
  BookMarked,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "../contexts/auth-context"
import { NotificationsPopover } from "@/components/notifications"
import LogHoursDialog from "@/components/log-hours-dialog"
import { readDemoHours, useKids, writeDemoHours } from "@/lib/demo-kids"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

type RoomLink = {
  name: string
  href: string
  matchPrefix: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

// The five calm rooms are the primary nav.
const PRIMARY_ROOMS: RoomLink[] = [
  { name: "Today", href: "/today", matchPrefix: "/today", icon: Home },
  { name: "Teach", href: "/teach", matchPrefix: "/teach", icon: Presentation },
  { name: "Family", href: "/family/calm", matchPrefix: "/family", icon: Heart },
  { name: "Community", href: "/people", matchPrefix: "/people", icon: Users },
  { name: "Library", href: "/library", matchPrefix: "/library", icon: BookMarked },
]

// Routes that render no calm-shell chrome (landing, auth, fullscreen teach mode).
function isChromelessRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/offline") ||
    pathname.startsWith("/kid/") || // Kid Mode (hand-to-learner)
    pathname.startsWith("/teach/") // in-lesson teach mode
  )
}

export default function Navigation() {
  const pathname = usePathname() ?? "/"
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const { user, signOut, loading } = useAuth()
  const { toast } = useToast()
  const kids = useKids()

  if (isChromelessRoute(pathname)) return null

  const handleLog = (data: { childId: string; subject: string; hours: number; date: string; notes?: string }) => {
    const prev = readDemoHours()
    const next = { ...prev, [data.childId]: (prev[data.childId] ?? 0) + data.hours }
    writeDemoHours(next)
    const kid = kids.find((k) => k.id === data.childId)
    const minutes = Math.round(data.hours * 60)
    const durationLabel = minutes < 60 ? `${minutes} min` : `${(minutes / 60).toFixed(2).replace(/\.?0+$/, "")} hr`
    toast({
      title: "Logged",
      description: `${durationLabel} of ${data.subject} for ${kid?.name ?? "learner"}.`,
      duration: 5000,
      action: (
        <ToastAction
          altText="Undo log"
          onClick={() => {
            writeDemoHours(prev)
            toast({ title: "Undone", description: "Log removed.", duration: 2000 })
          }}
        >
          Undo
        </ToastAction>
      ),
    })
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <>
      <header className="atoz-topbar">
        <div className="atoz-topbar__inner">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] sm:w-[300px]">
                <div className="flex flex-col gap-6 py-4">
                  <Link
                    href="/today"
                    className="atoz-brand"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="atoz-brand-mark">A</span>
                    <span>AtoZ Family</span>
                  </Link>
                  <nav className="flex flex-col gap-1">
                    {PRIMARY_ROOMS.map((item) => (
                      <MobileLink
                        key={item.href}
                        room={item}
                        active={pathname.startsWith(item.matchPrefix)}
                        onClick={() => setMobileOpen(false)}
                      />
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/today" className="atoz-brand">
              <span className="atoz-brand-mark">A</span>
              <span className="hidden sm:inline">AtoZ Family</span>
            </Link>
          </div>

          <nav className="atoz-top-nav" aria-label="Main">
            {PRIMARY_ROOMS.map((room) => (
              <Link
                key={room.href}
                href={room.href}
                aria-current={pathname.startsWith(room.matchPrefix) ? "page" : undefined}
              >
                {room.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {user && (
              <button
                type="button"
                onClick={() => setLogOpen(true)}
                className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--sage-ll)] text-[var(--sage-dd)] border border-[var(--sage-l)] hover:bg-[var(--sage-l)] transition"
              >
                <Plus size={14} /> Log hours
              </button>
            )}

            {!loading &&
              (user ? (
                <>
                  <NotificationsPopover />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="rounded-full focus:outline-none focus-visible:ring-2 ring-[var(--sage-d)]"
                        aria-label="Account menu"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.photoURL || "/placeholder.svg"}
                            alt={user.displayName || "User"}
                          />
                          <AvatarFallback className="bg-[var(--terracotta)] text-white font-display">
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[220px]">
                      <DropdownMenuLabel className="font-display font-normal">
                        {user.displayName || user.email || "Account"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <UserIcon className="mr-2 h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" /> Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
                  >
                    <Link href="/sign-up">Sign up</Link>
                  </Button>
                </>
              ))}
          </div>
        </div>
      </header>

      {user && (
        <>
          <button
            type="button"
            aria-label="Log hours"
            onClick={() => setLogOpen(true)}
            className="atoz-fab"
          >
            <Plus size={22} strokeWidth={2.2} />
          </button>
          <LogHoursDialog
            open={logOpen}
            onOpenChange={setLogOpen}
            children={kids}
            defaultKidId={kids[0]?.id ?? "emma"}
            defaultSubject="Mathematics"
            defaultMinutes={30}
            onSubmit={handleLog}
          />
        </>
      )}

      <nav className="atoz-phone-bottom-nav" aria-label="Rooms">
        {PRIMARY_ROOMS.map((room) => {
          const Icon = room.icon
          const active = pathname.startsWith(room.matchPrefix)
          return (
            <Link
              key={room.href}
              href={room.href}
              aria-current={active ? "page" : undefined}
              className={active ? "is-active" : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{room.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

function MobileLink({
  room,
  active,
  onClick,
}: {
  room: RoomLink
  active: boolean
  onClick: () => void
}) {
  const Icon = room.icon
  return (
    <Link
      href={room.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
        active ? "bg-[var(--sage-ll)] text-[var(--sage-dd)]" : "text-[var(--ink-2)] hover:bg-[var(--linen-d)]"
      }`}
    >
      <Icon size={18} aria-hidden="true" />
      {room.name}
    </Link>
  )
}
