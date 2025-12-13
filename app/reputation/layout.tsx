import { NavBar } from "@/components/nav-bar";

export default function ReputationLayout({
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
