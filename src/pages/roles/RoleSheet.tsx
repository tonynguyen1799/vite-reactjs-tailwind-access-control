// src/pages/roles/RoleSheet.tsx

import { useState, useEffect, useRef } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Role, Privilege } from "@/apis/types"
import { createRoleApi, updateRoleApi } from "@/apis/role.api"
import { globalNotify } from "@/lib/notify"
import { Loader2 } from "lucide-react"

// Validation schema for the role form
const formSchema = z.object({
  name: z.string().min(2, { message: "Role name must be at least 2 characters." }).max(50, { message: "Role name must not exceed 50 characters."}),
  description: z.string().max(255, { message: "Description must not exceed 255 characters." }).optional(),
  privileges: z.array(z.string()).min(1, { message: "You must select at least one privilege." }),
})

type FormValues = z.infer<typeof formSchema>;

interface RoleSheetProps {
  initialData: Role | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSuccess: () => void
  privileges: Privilege[]
}

const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date(timestamp));
}

export function RoleSheet({ initialData, isOpen, onOpenChange, onSuccess, privileges }: RoleSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const isEditMode = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      privileges: [],
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        form.reset({
          name: initialData.name.replace("ROLE_", ""),
          description: initialData.description || "",
          privileges: initialData.privileges,
        })
      } else {
        form.reset({
          name: "",
          description: "",
          privileges: [],
        });
        setTimeout(() => {
            nameInputRef.current?.focus();
        }, 100);
      }
    }
  }, [initialData, isOpen, form, isEditMode]);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    const roleName = `ROLE_${values.name.toUpperCase()}`;
    const submissionData = { ...values, name: roleName, privileges: values.privileges };

    try {
      if (isEditMode && initialData) {
        await updateRoleApi(initialData.textId, submissionData);
        globalNotify({ title: "Success", description: "Role updated successfully." });
      } else {
        await createRoleApi(submissionData);
        globalNotify({ title: "Success", description: "Role created successfully." });
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to save role:", error)
      globalNotify({
        variant: "destructive",
        title: "Save Failed",
        description: error.response?.data?.message || "Could not save the role.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditMode ? "Edit Role" : "Add New Role"}</SheetTitle>
          <SheetDescription>
            {isEditMode ? "Update the role's details and permissions." : "Fill in the details to create a new role."}
          </SheetDescription>
        </SheetHeader>
        <div>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Role Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                            <div className="flex items-center">
                                <span className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-l-md border border-r-0">ROLE_</span>
                                <Input 
                                    placeholder="ADMIN" 
                                    {...field} 
                                    ref={nameInputRef}
                                    className="rounded-l-none"
                                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase().replace(/[^A-Z_]/g, ''); field.onChange(e); }}
                                />
                            </div>
                        </FormControl>
                        <FormDescription>The unique identifier for the role.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="A brief summary of what this role can do."
                                className="resize-none"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="privileges"
                    render={() => (
                        <FormItem>
                        <div className="mb-4">
                            <FormLabel>Privileges <span className="text-destructive">*</span></FormLabel>
                            <FormDescription>
                            Select the permissions this role should have.
                            </FormDescription>
                        </div>
                        <div className="space-y-2">
                            {privileges.map((privilege) => (
                            <FormField
                                key={privilege.name}
                                control={form.control}
                                name="privileges"
                                render={({ field }) => {
                                return (
                                    <FormItem
                                    key={privilege.name}
                                    className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"
                                    >
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value?.includes(privilege.name)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                            ? field.onChange([...field.value, privilege.name])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== privilege.name
                                                )
                                            )
                                        }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal w-full">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{privilege.name}</span>
                                            <p className="text-xs font-normal text-muted-foreground">{privilege.description}</p>
                                        </div>
                                    </FormLabel>
                                    </FormItem>
                                )
                                }}
                            />
                            ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                {isEditMode && initialData && (
                  <div className="space-y-1 pt-2">
                      <p className="text-xs text-muted-foreground">
                          Created on <span className="font-medium text-foreground">{formatDate(initialData.createdAt)}</span> by <span className="font-medium text-foreground">{initialData.createdBy || '-'}</span>
                      </p>
                      {initialData.updatedAt && (
                      <p className="text-xs text-muted-foreground">
                          Last updated on <span className="font-medium text-foreground">{formatDate(initialData.updatedAt)}</span> by <span className="font-medium text-foreground">{initialData.updatedBy || '-'}</span>
                      </p>
                      )}
                  </div>
                )}
                
                <SheetFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? "Save Changes" : "Create Role"}
                    </Button>
                </SheetFooter>
            </form>
            </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}