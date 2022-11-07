import * as gameClient from "../services/gameClient";
import { dispatch } from "../state";
import {
    dismissToast,
    setNetMode,
    setGameInfo,
    showToast,
    setClientRole,
} from "../state/actions";
import { cleanupJoinCode } from "../util";

export async function joinGameAsync(joinCode: string | undefined) {
    joinCode = cleanupJoinCode(joinCode);
    if (!joinCode) {
        return dispatch(
            showToast({
                type: "error",
                text: lf("Invalid join code. Please try again."),
                timeoutMs: 5000,
            })
        );
    }
    const connectingToast = showToast({
        type: "info",
        text: lf("Connecting..."),
        showSpinner: true,
    });
    try {
        dispatch(setNetMode("connecting"));
        dispatch(connectingToast);

        const joinResult = await gameClient.joinGameAsync(joinCode);
        console.log(joinResult);

        if (joinResult.success) {
            dispatch(
                showToast({
                    type: "success",
                    text: lf("Connected!"),
                    timeoutMs: 5000,
                })
            );
            dispatch(setClientRole("guest"));
            dispatch(setGameInfo(joinResult));
            dispatch(setNetMode("connected"));
        } else {
            dispatch(
                showToast({
                    type: "info",
                    text: lf("Game not found"),
                    timeoutMs: 5000,
                })
            );
            dispatch(setNetMode("init"));
        }
    } catch (e) {
        console.log("error", e);
        dispatch(setNetMode("init"));
        dispatch(
            showToast({
                type: "error",
                text: lf("Something went wrong. Please try again."),
                timeoutMs: 5000,
            })
        );
    } finally {
        dispatch(dismissToast(connectingToast.toast.id));
    }
}