import { redirect } from "next/navigation";

export default function Home() {
  // أول ما حد يفتح الموقع، هيدخله علطول على صفحة الـ login
  redirect("/login");
}