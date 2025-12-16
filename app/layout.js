import './globals.css'
export const metadata = {
  title: 'Clinic Daily Recon',
  description: 'Daily reconciliation system for clinics',
}
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
