import { HTTPStep } from "./http";
import { RenderStep } from "./render";
import { MutationStep } from "./mutation";
import { SwapStep } from "./swap";

export type Step = HTTPStep | RenderStep | MutationStep | SwapStep