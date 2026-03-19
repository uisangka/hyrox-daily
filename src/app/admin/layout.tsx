export const metadata = {
  title: 'Admin - HYROX Daily',
  description: 'Admin panel for managing workouts',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
