import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { SettingsBar } from "../settings/SettingsBar";

interface WelcomeScreenProps {
    onStart: () => void;
}

export function WelcomeScreen({ onStart }: Readonly<WelcomeScreenProps>) {
    const { t } = useTranslation();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
            <div className="flex justify-end w-full mb-4">
                <SettingsBar />
            </div>
            <Card className="max-w-md mx-auto text-center" role="main" aria-label={t("welcome.title")}>
                <CardHeader className="space-y-4">
                    <CardTitle className="text-4xl font-bold text-gray-800">{t("welcome.title")}</CardTitle>
                    <CardDescription className="text-lg text-gray-600">{t("welcome.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={onStart}
                        size="lg"
                        className="w-full text-lg py-6"
                        aria-label={t("welcome.startButton")}
                    >
                        {t("welcome.startButton")}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
