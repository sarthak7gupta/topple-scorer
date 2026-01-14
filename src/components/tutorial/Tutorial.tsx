import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface TutorialStep {
    titleKey: string;
    contentKey: string;
    target?: string; // CSS selector for element to highlight
}

const tutorialStepKeys: TutorialStep[] = [
    {
        titleKey: "tutorial.welcome.title",
        contentKey: "tutorial.welcome.content",
    },
    { titleKey: "tutorial.setup.title", contentKey: "tutorial.setup.content" },
    {
        titleKey: "tutorial.rolling.title",
        contentKey: "tutorial.rolling.content",
    },
    {
        titleKey: "tutorial.placing.title",
        contentKey: "tutorial.placing.content",
    },
    {
        titleKey: "tutorial.scoring.title",
        contentKey: "tutorial.scoring.content",
    },
    {
        titleKey: "tutorial.topples.title",
        contentKey: "tutorial.topples.content",
    },
    {
        titleKey: "tutorial.controls.title",
        contentKey: "tutorial.controls.content",
    },
    {
        titleKey: "tutorial.analytics.title",
        contentKey: "tutorial.analytics.content",
    },
];

interface TutorialProps {
    onClose: () => void;
}

export function Tutorial({ onClose }: Readonly<TutorialProps>) {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);

    const totalSteps = tutorialStepKeys.length;

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const currentTutorial = tutorialStepKeys[currentStep];
    const title = t(currentTutorial.titleKey);
    const content = t(currentTutorial.contentKey);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{t("tutorial.titlePrefix", { title })}</CardTitle>
                            <CardDescription>
                                {t("tutorial.step", {
                                    current: currentStep + 1,
                                    total: totalSteps,
                                })}
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} aria-label={t("tutorial.close")}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-lg">{content}</p>

                    <div className="flex justify-between items-center pt-4">
                        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            {t("tutorial.previous")}
                        </Button>

                        <div className="flex gap-2">
                            {tutorialStepKeys.map((step, index) => (
                                <div
                                    key={step.titleKey}
                                    className={`w-2 h-2 rounded-full ${
                                        index === currentStep ? "bg-blue-500" : "bg-gray-300"
                                    }`}
                                    aria-label={t("tutorial.step", {
                                        current: index + 1,
                                        total: totalSteps,
                                    })}
                                />
                            ))}
                        </div>

                        <Button onClick={nextStep}>
                            {currentStep === totalSteps - 1 ? t("tutorial.finish") : t("tutorial.next")}
                            {currentStep < totalSteps - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
