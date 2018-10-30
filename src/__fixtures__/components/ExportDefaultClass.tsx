import * as React from "react";

interface IProgressBarProps {
  currentStep: number;
  stepsCount: number;
}

/**
 * Class Component Default Exported
 */
export default class ProgressBar extends React.Component<IProgressBarProps> {
  render() {
    const { stepsCount, currentStep } = this.props;

    return (
      <div>
        {currentStep}/{stepsCount}
      </div>
    );
  }
}
