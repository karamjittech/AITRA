import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "./use-toast";

export const CREDIT_COSTS = {
  sentiment: 5,
  fan_out: 10,
  sov: 20,
  schema: 2,
  eeat: 15,
} as const;

export function useCreditDeduction() {
  const [isDeducting, setIsDeducting] = useState(false);
  const { toast } = useToast();

  const deductCredits = async (
    actionType: keyof typeof CREDIT_COSTS,
    metadata: Record<string, any> = {}
  ): Promise<boolean> => {
    setIsDeducting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue",
          variant: "destructive",
        });
        return false;
      }

      const cost = CREDIT_COSTS[actionType];

      const { data: result, error } = await (supabase.rpc as any)("deduct_credits", {
        p_user_id: user.id,
        p_credits: cost,
        p_action_type: actionType,
        p_metadata: metadata,
      });

      if (error) {
        console.error("Credit deduction error:", error);
        toast({
          title: "Credit deduction failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (!result) {
        toast({
          title: "Insufficient credits",
          description: `This action requires ${cost} credits. Please upgrade your plan.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to deduct credits",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeducting(false);
    }
  };

  const preFlightCheck = async (actionType: keyof typeof CREDIT_COSTS): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const cost = CREDIT_COSTS[actionType];

      const { data: userData, error } = await supabase
        .from("users")
        .select("credits_total, credits_used")
        .eq("id", user.id)
        .single();

      if (error) return false;

      const remaining = ((userData as any).credits_total || 0) - ((userData as any).credits_used || 0);
      return remaining >= cost;
    } catch {
      return false;
    }
  };

  return {
    deductCredits,
    preFlightCheck,
    isDeducting,
    CREDIT_COSTS,
  };
}
