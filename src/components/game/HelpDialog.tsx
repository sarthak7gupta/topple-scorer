import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { HelpCircle } from "lucide-react";

export function HelpDialog() {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" title={t("help.title")} aria-label={t("help.title")}>
                    <HelpCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span>{t("help.title")}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t("help.title")}</DialogTitle>
                    <DialogDescription>{t("help.description")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4 overflow-y-auto flex-1 min-h-0">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{t("help.whatYouNeed")}</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>{t("help.toppleTower")}</li>
                            <li>{t("help.topplePieces")}</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{t("help.objective")}</h3>
                        <p className="text-sm text-muted-foreground">{t("help.objectiveDescription")}</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{t("help.numberOfPlayers")}</h3>
                        <p className="text-sm text-muted-foreground">{t("help.numberOfPlayersDescription")}</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{t("help.preparation")}</h3>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            <li>{t("help.preparation1")}</li>
                            <li>{t("help.preparation2")}</li>
                            <li>{t("help.preparation3")}</li>
                            <li>{t("help.preparation4")}</li>
                        </ol>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{t("help.initialDiceRoll")}</h3>
                        <p className="text-sm text-muted-foreground">{t("help.initialDiceRollDescription")}</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{t("help.duringGame")}</h3>
                        <p className="text-sm text-muted-foreground">{t("help.duringGameDescription")}</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{t("help.scoring")}</h3>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div>
                                <p className="font-medium text-foreground">{t("help.scoring1Title")}</p>
                                <p>{t("help.scoring1Description")}</p>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{t("help.scoring2Title")}</p>
                                <p>{t("help.scoring2Description")}</p>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{t("help.scoring3Title")}</p>
                                <p>{t("help.scoring3Description")}</p>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{t("help.scoring4Title")}</p>
                                <p>{t("help.scoring4Description")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{t("help.remember")}</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>{t("help.remember1")}</li>
                            <li>{t("help.remember2")}</li>
                            <li>{t("help.remember3")}</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{t("help.winning")}</h3>
                        <p className="text-sm text-muted-foreground">{t("help.winningDescription")}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
