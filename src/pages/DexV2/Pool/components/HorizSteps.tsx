import { Step, StepState } from 'pages/DexV2/types';
import React from 'react';
import styled from 'styled-components';

interface HorizStepsProps {
  steps: Step[];
}

const HorizSteps: React.FC<HorizStepsProps> = ({ steps }) => {
  return (
    <StepsContainer>
      {steps.map((step, i) => (
        <StepStyled key={i} className="step">
          <Tooltip>
            {step.state === StepState.Completed ? (
              <CheckIcon className="w-8 h-8" />
            ) : step.state === StepState.Pending ? (
              <>
                <StepNumber className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {i + 1}
                </StepNumber>
                <SpinnerIcon className="w-8 h-8 animate-spin" />
              </>
            ) : (
              <StepNumber>{i + 1}</StepNumber>
            )}
          </Tooltip>
        </StepStyled>
      ))}
    </StepsContainer>
  );
};

const StepsContainer = styled.div`
  display: flex;
`;

const StepStyled = styled.div`
  width: 2rem; /* w-8 */
  height: 2rem; /* h-8 */
  border-radius: 9999px; /* rounded-full */
  border: 1px solid #d1d5db; /* border */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* shadow */
  font-weight: 500; /* font-medium */
  display: flex; /* flex */
  align-items: center; /* items-center */
  justify-content: center; /* justify-center */
  position: relative; /* relative */
`;

const Tooltip = styled.div`
  position: relative;
`;

const StepNumber = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const CheckIcon = styled.div`
  width: 2rem; /* w-8 */
  height: 2rem; /* h-8 */
  /* Add your CheckIcon styles here */
`;

const SpinnerIcon = styled.div`
  width: 2rem; /* w-8 */
  height: 2rem; /* h-8 */
  animation: spin 1s linear infinite; /* animate-spin */
  /* Add your SpinnerIcon styles here */

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default HorizSteps;