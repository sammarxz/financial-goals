import React, { memo } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { InvestmentCard } from "./InvestmentCard";
import { ProgressBar } from "./ProgressBar";
import { DateRangePicker } from "./DateRangePicker";

// Memoize components that receive static props
export const MemoizedButton = memo(Button);
export const MemoizedInput = memo(Input);
export const MemoizedInvestmentCard = memo(InvestmentCard);
export const MemoizedProgressBar = memo(ProgressBar);
export const MemoizedDateRangePicker = memo(DateRangePicker);

// Proptypes for comparison function to optimize memo
const arePropsEqual = {
  Button: (prevProps: any, nextProps: any) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.variant === nextProps.variant &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.loading === nextProps.loading
    );
  },
  Input: (prevProps: any, nextProps: any) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.error === nextProps.error &&
      prevProps.label === nextProps.label
    );
  },
  ProgressBar: (prevProps: any, nextProps: any) => {
    return (
      prevProps.progress === nextProps.progress &&
      prevProps.showPercentage === nextProps.showPercentage &&
      prevProps.height === nextProps.height
    );
  },
};

// Optimized versions with custom comparison
export const OptimizedButton = memo(Button, arePropsEqual.Button);
export const OptimizedInput = memo(Input, arePropsEqual.Input);
export const OptimizedProgressBar = memo(
  ProgressBar,
  arePropsEqual.ProgressBar
);
