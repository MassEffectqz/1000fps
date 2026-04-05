"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Пример Server Action
export async function exampleAction(formData: FormData) {
  const data = formData.get("data") as string;
  
  // Валидация и обработка данных
  if (!data) {
    return { success: false, error: "Данные не предоставлены" };
  }
  
  // Логика действия
  console.log("Processing:", data);
  
  // Рекейд пути после изменения данных
  revalidatePath("/");
  
  return { success: true, data };
}

// Action для перенаправления
export async function redirectAction(path: string) {
  redirect(path);
}
