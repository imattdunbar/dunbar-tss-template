import type { ReactNode } from 'react'
import { BellIcon, PlusIcon, SearchIcon, SettingsIcon } from 'lucide-react'
import { Avatar, AvatarBadge, AvatarFallback } from '@dunbar/ui-template/components/avatar'
import { Button } from '@dunbar/ui-template/components/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@dunbar/ui-template/components/card'
import { Checkbox } from '@dunbar/ui-template/components/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut
} from '@dunbar/ui-template/components/command'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@dunbar/ui-template/components/context-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@dunbar/ui-template/components/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@dunbar/ui-template/components/drawer'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@dunbar/ui-template/components/dropdown-menu'
import { Input } from '@dunbar/ui-template/components/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@dunbar/ui-template/components/input-group'
import { Kbd } from '@dunbar/ui-template/components/kbd'
import { Label } from '@dunbar/ui-template/components/label'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger
} from '@dunbar/ui-template/components/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@dunbar/ui-template/components/select'
import { Separator } from '@dunbar/ui-template/components/separator'
import { Textarea } from '@dunbar/ui-template/components/textarea'
import { Toaster, toast } from '@dunbar/ui-template/components/toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@dunbar/ui-template/components/tooltip'

function DemoSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t pt-8 md:grid-cols-[220px_1fr]">
      <div>
        <h2 className="font-heading text-lg font-medium">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm leading-6">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

type UIDemoProps = {
  onPreviewError?: () => void
  onPreviewNotFound?: () => void
}

export function UIDemo({ onPreviewError, onPreviewNotFound }: UIDemoProps = {}) {
  return (
    <Toaster>
      <TooltipProvider>
        <main className="bg-background text-foreground isolate min-h-svh">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:px-12">
            <header className="grid gap-4">
              <div className="text-primary flex items-center gap-2 text-sm font-medium">
                <span className="bg-primary size-2 rounded-full" />
                @dunbar/ui-template
              </div>
              <div className="max-w-3xl">
                <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">Component workshop</h1>
                <p className="text-muted-foreground mt-4 text-base leading-7">
                  A shared sandbox for the Base Nova components. Explore their variants, focus states, and interactions.
                </p>
              </div>
            </header>

            {(onPreviewError || onPreviewNotFound) && (
              <DemoSection title="Page states" description="Preview the app's error and not found pages.">
                <div className="flex flex-wrap items-center gap-3">
                  {onPreviewError && (
                    <Button variant="destructive" onClick={onPreviewError}>
                      Preview error page
                    </Button>
                  )}
                  {onPreviewNotFound && (
                    <Button variant="outline" onClick={onPreviewNotFound}>
                      Preview not found page
                    </Button>
                  )}
                </div>
              </DemoSection>
            )}

            <DemoSection title="Buttons" description="Variants, sizes, icons, and disabled states.">
              <div className="flex flex-wrap items-center gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
                <Button size="xs">Extra small</Button>
                <Button size="sm">
                  <PlusIcon data-icon="inline-start" />
                  Small
                </Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Notifications">
                  <BellIcon />
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </DemoSection>

            <DemoSection title="Cards" description="Surfaces with headers, actions, content, and footers.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Workspace activity</CardTitle>
                    <CardDescription>A standard card with an action and footer.</CardDescription>
                    <CardAction>
                      <Button variant="ghost" size="icon-sm" aria-label="Workspace settings">
                        <SettingsIcon />
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {['12 notes', '4 people', '2 devices'].map((value) => (
                        <div key={value} className="bg-muted rounded-lg p-3 text-center text-sm">
                          {value}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="text-muted-foreground text-xs">Demo data only</CardFooter>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>Compact card</CardTitle>
                    <CardDescription>The small density option uses less space.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm leading-6">
                    Use cards for related information and focused actions.
                  </CardContent>
                </Card>
              </div>
            </DemoSection>

            <DemoSection title="Form controls" description="Inputs, labels, checkboxes, select menus, and separators.">
              <Card className="max-w-xl">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Try the keyboard and focus states. No data is saved.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="demo-name">Display name</Label>
                    <Input id="demo-name" defaultValue="Alex Morgan" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="demo-email">Email address</Label>
                    <Input id="demo-email" type="email" placeholder="you@example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="demo-application">Default application</Label>
                    <Select
                      defaultValue="web"
                      items={[
                        { label: 'Web', value: 'web' },
                        { label: 'Desktop', value: 'desktop' },
                        { label: 'Mobile', value: 'mobile' }
                      ]}
                    >
                      <SelectTrigger id="demo-application" className="w-full">
                        <SelectValue placeholder="Choose an application" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Applications</SelectLabel>
                          <SelectItem value="web">Web</SelectItem>
                          <SelectItem value="desktop">Desktop</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Checkbox id="demo-updates" defaultChecked />
                    <div className="grid gap-1">
                      <Label htmlFor="demo-updates">Automatic updates</Label>
                      <p className="text-muted-foreground text-sm">Install stable application updates automatically.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DemoSection>

            <DemoSection title="Overlays" description="Dialog, dropdown menu, and tooltip portals.">
              <div className="flex flex-wrap items-center gap-3">
                <Dialog>
                  <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share workspace</DialogTitle>
                      <DialogDescription>Try a form inside a dialog. This demo does not submit data.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                      <Label htmlFor="demo-dialog-email">Email address</Label>
                      <Input id="demo-dialog-email" type="email" placeholder="person@example.com" />
                    </div>
                    <DialogFooter showCloseButton>
                      <Button
                        onClick={() =>
                          toast.add({ title: 'Demo invitation', description: 'No invitation was sent.', type: 'info' })
                        }
                      >
                        Send invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" />}>Open menu</DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                      <DropdownMenuItem>
                        New note<DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Invite member</DropdownMenuItem>
                      <DropdownMenuCheckboxItem defaultChecked>Show archived items</DropdownMenuCheckboxItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">Delete workspace</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="ghost" />}>Hover for tooltip</TooltipTrigger>
                  <TooltipContent>Shared from @dunbar/ui-template</TooltipContent>
                </Tooltip>
              </div>
            </DemoSection>

            <DemoSection
              title="Search controls"
              description="Input groups, keyboard hints, command menus, and textareas."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Input group</CardTitle>
                    <CardDescription>A search field with an icon and keyboard hint.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InputGroup>
                      <InputGroupInput aria-label="Search notes" placeholder="Search notes..." />
                      <InputGroupAddon>
                        <SearchIcon />
                      </InputGroupAddon>
                      <InputGroupAddon align="inline-end">
                        <Kbd>⌘K</Kbd>
                      </InputGroupAddon>
                    </InputGroup>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Textarea</CardTitle>
                    <CardDescription>A multiline field for notes.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea aria-label="Notes" placeholder="Add a note..." className="min-h-32" />
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Command</CardTitle>
                    <CardDescription>Filter and select actions with the keyboard.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Command className="h-64 border">
                      <CommandInput placeholder="Search actions..." />
                      <CommandList>
                        <CommandEmpty>No actions found.</CommandEmpty>
                        <CommandGroup heading="Workspace">
                          <CommandItem
                            value="search-notes"
                            onSelect={() => toast.add({ title: 'Search notes selected', type: 'info' })}
                          >
                            Search notes<CommandShortcut>⌘K</CommandShortcut>
                          </CommandItem>
                          <CommandItem
                            value="browse-tags"
                            onSelect={() => toast.add({ title: 'Browse tags selected', type: 'info' })}
                          >
                            Browse tags
                          </CommandItem>
                          <CommandItem
                            value="open-archive"
                            onSelect={() => toast.add({ title: 'Open archive selected', type: 'info' })}
                          >
                            Open archive
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </CardContent>
                </Card>
              </div>
            </DemoSection>

            <DemoSection
              title="Interactive surfaces"
              description="Avatar, popover, nested drawer, toast, and context menu."
            >
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar size="lg">
                    <AvatarFallback>AM</AvatarFallback>
                    <AvatarBadge className="bg-emerald-500" />
                  </Avatar>
                  <Popover>
                    <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
                    <PopoverContent align="start">
                      <PopoverHeader>
                        <PopoverTitle>Account</PopoverTitle>
                        <PopoverDescription>Content anchored to a button.</PopoverDescription>
                      </PopoverHeader>
                    </PopoverContent>
                  </Popover>
                  <DrawerDemo />
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.add({ title: 'Note saved', description: 'This is a demo notification.', type: 'success' })
                    }
                  >
                    Show toast
                  </Button>
                </div>
                <ContextMenu>
                  <ContextMenuTrigger className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed text-sm">
                    Right-click or long-press here
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuGroup>
                      <ContextMenuLabel>Note actions</ContextMenuLabel>
                      <ContextMenuItem onClick={() => toast.add({ title: 'Copy selected', type: 'info' })}>
                        Copy
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => toast.add({ title: 'Duplicate selected', type: 'info' })}>
                        Duplicate
                      </ContextMenuItem>
                    </ContextMenuGroup>
                    <ContextMenuSeparator />
                    <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </div>
            </DemoSection>
          </div>
        </main>
      </TooltipProvider>
    </Toaster>
  )
}

function DrawerDemo() {
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger render={<Button variant="secondary" />}>Open drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer</DrawerTitle>
          <DrawerDescription>Drag the handle or open a nested drawer.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <div className="bg-muted h-32 rounded-lg" />
        </div>
        <DrawerFooter>
          <Drawer showSwipeHandle>
            <DrawerTrigger render={<Button variant="outline" />}>Open nested drawer</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Nested drawer</DrawerTitle>
                <DrawerDescription>The parent drawer stays behind this one.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                <div className="bg-muted h-32 rounded-lg" />
              </div>
              <DrawerFooter>
                <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
