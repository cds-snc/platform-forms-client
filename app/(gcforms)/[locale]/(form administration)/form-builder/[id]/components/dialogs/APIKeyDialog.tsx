"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";

interface ApiKeyEvents extends CustomEvent {
    detail: {
        onDownload: () => void;
    };
}


export const ApiKeyDialog = () => {
    const dialog = useDialogRef();
    const { Event } = useCustomEvent();
    const { t } = useTranslation("form-builder");
    const [handler, setHandler] = useState<ApiKeyEvents | null>(null);

    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => {
        dialog.current?.close();
        setIsOpen(false);
    };

    const handleOpenDialog = useCallback((detail: ApiKeyEvents) => {
        if (detail) {
            setHandler(detail);
            setIsOpen(true);
        }
    }, []);

    useEffect(() => {
        Event.on("open-api-key-dialog", handleOpenDialog({
            detail: {
                onDownload: () => {
                    alert("Download");
                }
            },
        }));
        return () => {
            Event.off("open-api-key-dialog", handleOpenDialog());
        };
    }, [Event, handleOpenDialog]);

    const actions = (
        <>
            <Button
                theme="secondary"
                onClick={() => {
                    dialog.current?.close();
                    handleClose && handleClose();
                }}
            >
                {t("dynamicRow.dialog.cancel")}
            </Button>
            <Button
                className="ml-5"
                theme="primary"
                onClick={() => {
                    alert("Save");
                }}
                dataTestId="confirm-delete"
            >
                {t("dynamicRow.dialog.save")}
            </Button>
        </>
    );

    return (
        <>
            {isOpen && (
                <Dialog
                    handleClose={handleClose}
                    dialogRef={dialog}
                    actions={actions}
                    title={t("dynamicRow.dialog.title")}
                >
                    <div className="p-5">
                        Body
                    </div>
                </Dialog>
            )}
        </>
    );
};