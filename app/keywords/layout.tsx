import { NavBar } from "@/components/nav-bar";

export default function KeywordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
