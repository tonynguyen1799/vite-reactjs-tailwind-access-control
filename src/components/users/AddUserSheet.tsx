import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Role } from "@/apis/types"
import { createUserApi } from "@/apis/user.api"
import { globalNotify } from "@/lib/notify"
import { Loader2, Check, ChevronsUpDown, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"


// Validation schema for the form
const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  enabled: z.boolean().default(true),
  roleTextIds: z.array(z.string()).min(1, { message: "You must select at least one role." }),
})

interface AddUserSheetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onUserAdded: () => void
  roles: Role[]
}

export function AddUserSheet({ isOpen, onOpenChange, onUserAdded, roles }: AddUserSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      enabled: true,
      roleTextIds: [],
    },
  })

  // When the sheet is closed, reset the form
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await createUserApi(values)
      globalNotify({
        title: "Success",
        description: "User created successfully.",
      })
      onUserAdded() // Trigger refetch on the parent page
      onOpenChange(false) // Close the dialog
    } catch (error) {
      console.error("Failed to create user:", error)
      globalNotify({
        variant: "destructive",
        title: "Creation Failed",
        description: "Could not create the user.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const selectedRoles = roles.filter(role => form.watch('roleTextIds').includes(role.textId));

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New User</SheetTitle>
          <SheetDescription>
            Fill in the details below to create a new user account.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <FormLabel>Enable User</FormLabel>
                            <FormDescription>
                                Allow this user to sign in immediately.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roleTextIds"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Roles</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                    "w-full justify-between h-auto", // Set height to auto
                                    !field.value.length && "text-muted-foreground"
                                    )}
                                >
                                    <div className="flex gap-1 flex-wrap">
                                        {selectedRoles.length > 0
                                            ? selectedRoles.map(role => (
                                                <Badge
                                                    variant="secondary"
                                                    key={role.textId}
                                                    className="mr-1"
                                                >
                                                    {role.name.replace('ROLE_', '')}
                                                </Badge>
                                            ))
                                            : "Select roles..."}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search roles..." />
                                    <CommandList>
                                        <CommandEmpty>No roles found.</CommandEmpty>
                                        <CommandGroup>
                                            {roles.map((role) => (
                                            <CommandItem
                                                value={role.name}
                                                key={role.textId}
                                                onSelect={() => {
                                                    const currentRoles = field.value || [];
                                                    const newRoles = currentRoles.includes(role.textId)
                                                        ? currentRoles.filter((id) => id !== role.textId)
                                                        : [...currentRoles, role.textId];
                                                    field.onChange(newRoles);
                                                }}
                                            >
                                                <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    field.value.includes(role.textId) ? "opacity-100" : "opacity-0"
                                                )}
                                                />
                                                {role.name.replace('ROLE_', '')}
                                            </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <FormDescription>
                            Assign one or more roles to this user.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create User
                    </Button>
                </SheetFooter>
            </form>
            </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
