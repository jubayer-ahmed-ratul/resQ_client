import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main
        className="flex min-h-screen items-center justify-center px-6 py-0"
        style={{ backgroundColor: "#F5F7FA" }}
      >
        {children}
      </main>

      <Footer />
    </>
  );
}
