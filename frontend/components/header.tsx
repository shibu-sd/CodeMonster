'use client'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { useScroll } from 'motion/react'
import { ThemeToggle } from '@/components/theme-toggle'

const menuItems = [
    { name: 'Features', href: '#link' },
    { name: 'Solution', href: '#link' },
    { name: 'Pricing', href: '#link' },
    { name: 'About', href: '#link' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)

    const { scrollYProgress } = useScroll()

    React.useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            setScrolled(latest > 0.05)
        })
        return () => unsubscribe()
    }, [scrollYProgress])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className={cn('fixed z-20 w-full border-b transition-colors duration-150', scrolled && 'bg-background/50 backdrop-blur-3xl')}>
                <div className="mx-auto max-w-7xl px-6 transition-all duration-300">
                    <div className="relative flex items-center justify-between py-3 lg:py-4">
                        {/* Logo - Left */}
                        <div className="flex items-center">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center">
                                <Logo />
                            </Link>
                        </div>

                        {/* Navigation - Center (hidden on mobile) */}
                        <div className="hidden lg:flex lg:flex-1 lg:justify-center">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMenuState(!menuState)}
                            aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                            className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                            <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                            <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                        </button>

                        {/* Auth Buttons - Right (hidden on mobile) */}
                        <div className="hidden lg:flex lg:items-center lg:gap-3">
                            <Button
                                asChild
                                variant="outline"
                                size="sm">
                                <Link href="#">
                                    <span>Login</span>
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="sm">
                                <Link href="#">
                                    <span>Sign Up</span>
                                </Link>
                            </Button>
                            <ThemeToggle />
                        </div>

                        {/* Mobile Menu */}
                        <div className="bg-background in-data-[state=active]:block mb-6 hidden w-full rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 lg:hidden dark:shadow-none">
                            <div className="space-y-6">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex flex-col space-y-3 pt-4 border-t">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm">
                                        <Link href="#">
                                            <span>Login</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="sm">
                                        <Link href="#">
                                            <span>Sign Up</span>
                                        </Link>
                                    </Button>
                                    <div className="flex justify-center pt-2">
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}