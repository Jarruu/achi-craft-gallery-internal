import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#E7E3E3] group-[.toaster]:text-[#2E2D31] group-[.toaster]:border-[0.5px] group-[.toaster]:border-[rgba(46,45,49,0.15)] group-[.toaster]:shadow-md group-[.toaster]:rounded-lg group-[.toaster]:font-sans group-[.toaster]:text-xs group-[.toaster]:p-4 group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3",
          description: "group-[.toast]:text-[#8E8E93]",
          actionButton:
            "group-[.toast]:bg-[#2E2D31] group-[.toast]:text-[#F3F1F1] group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-[#F3F1F1] group-[.toast]:text-[#8E8E93] group-[.toast]:rounded-md",
        },
      }}
      {...props}
    />
  )
}
