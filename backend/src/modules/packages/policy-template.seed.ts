import { PolicyTemplateService } from "./policy-template.service";

export async function seedPolicyTemplates() {
  try {
    await PolicyTemplateService.seedDefaultTemplates();
    console.log("Policy templates seeded successfully.");
  } catch (error) {
    console.error("Failed to seed policy templates:", error);
  }
}
