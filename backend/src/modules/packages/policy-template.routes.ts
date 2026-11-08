import { Router } from "express";
import {
  listPolicyTemplates,
  createPolicyTemplate,
  getPolicyTemplate,
  updatePolicyTemplate,
  deletePolicyTemplate,
  duplicatePolicyTemplate,
} from "./policy-template.controller";

const router = Router();

router.use((_req, _res, next) => {
  next();
});

router.get("/", listPolicyTemplates);
router.post("/", createPolicyTemplate);
router.get("/:id", getPolicyTemplate);
router.put("/:id", updatePolicyTemplate);
router.delete("/:id", deletePolicyTemplate);
router.post("/:id/duplicate", duplicatePolicyTemplate);

export const policyTemplateRouter = router;
