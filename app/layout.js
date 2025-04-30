import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Description } from "@radix-ui/react-dialog";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { Toaster } from "sonner";

const inter=Inter({subsets:["latin"]})

export const metadata={
  title:"",
  description:"Find your Dream Car",
}
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${inter.className}`}>
        <Header/>
        <Toaster richColors />


        <main className="min-h-screen">
        {children}
        </main>
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
                  <p>Learning ....</p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
