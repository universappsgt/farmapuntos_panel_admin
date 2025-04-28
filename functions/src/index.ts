/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// Initialize Firebase Admin SDK
import * as admin from "firebase-admin";
import { onDocumentWritten, onDocumentUpdated } from "firebase-functions/firestore";
import { logger } from "firebase-functions/v2";
admin.initializeApp();

// Cloud function to send notifications when transactions are approved
export const onTransactionStatusUpdate = onDocumentWritten(
  "transactions/{transactionId}",
  async (event) => {
    const newData = event.data?.after.data();
    const previousData = event.data?.before.data();

    // Check if status was changed to approved
    if (
      newData?.transactionStatus === "approved" &&
      previousData?.transactionStatus !== "approved"
    ) {
      try {
        // Get the client data from the transaction
        const client = newData.user;

        // Actualizar puntos de un cliente
        const userRef = admin
          .firestore()
          .collection("users")
          .doc(client.id);
        await userRef.update({  
          points: admin.firestore.FieldValue.increment(newData.points),
        });

        // If there are no notification tokens, exit
        if (
          !client.notificationTokens ||
          client.notificationTokens.length === 0
        ) {
          console.log("No notification tokens found for user:", client.id);
          return null;
        }

        // Prepare notification message
        const message = {
          notification: {
            title: "¡Transacción Aprobada!",
            // Split long string into multiple lines
            body:
              "Tu transacción ha sido aprobada y se han acreditado " +
              newData.rewardPoints +
              " puntos a tu cuenta.",
          },
          data: {
            transactionId: event.params.transactionId,
            type: "TRANSACTION_APPROVED",
          },
          tokens: client.notificationTokens, // Send to all client's devices
        };

        // Send the notification
        const response = await admin.messaging().sendEachForMulticast(message);

        console.log("Successfully sent notifications:", response.successCount);

        // Log any failures
        if (response.responses.some((resp) => !resp.success)) {
          const failedTokens: string[] = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(client.notificationTokens[idx]);
              console.error("Failed to send notification:", resp.error);
            }
          });

          // Remove failed tokens from user's tokens
          if (failedTokens.length > 0) {
            const userRef = admin
              .firestore()
              .collection("users")
              .doc(client.id);
            await userRef.update({
              notificationTokens: admin.firestore.FieldValue.arrayRemove(
                ...failedTokens
              ),
            });
          }
        }

        return null;
      } catch (error) {
        console.error("Error sending notification:", error);
        return null;
      }
    }

    return null;
  }
);

// Cloud function to send notifications when a user's 
// `isEnabled` status is set to true
export const onUserEnabled = onDocumentUpdated("users/{userId}", async (event) => {
  const previousData = event.data?.before.data();
  const newData = event.data?.after.data();

  // Check if isEnabled was changed to true
  if (newData?.isEnabled === true && previousData?.isEnabled !== true) {
    try {
      // Check for notification tokens
      const notificationTokens = newData.notificationTokens;

      if (!notificationTokens || notificationTokens.length === 0) {
        logger.info(
          "No notification tokens found for user:",
          event.params.userId
        );
        return null;
      }

      // Prepare notification message
      const message = {
        notification: {
          title: "¡Cuenta Activada!",
          body:
            "Tu cuenta ha sido activada exitosamente. " +
            "Ya puedes comenzar a usar la aplicación.",
        },
        data: {
          type: "ACCOUNT_ENABLED",
          userId: event.params.userId,
        },
        tokens: notificationTokens,
      };

      // Send the notification
      const response = await admin.messaging().sendEachForMulticast(message);

      logger.info("Successfully sent notifications:", response.successCount);

      // Handle failed tokens
      if (response.responses.some((resp) => !resp.success)) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(notificationTokens[idx]);
            logger.error("Failed to send notification:", resp.error);
          }
        });

        // Remove failed tokens
        if (failedTokens.length > 0) {
          const userRef = admin
            .firestore()
            .collection("users")
            .doc(event.params.userId);
          await userRef.update({
            notificationTokens: admin.firestore.FieldValue.arrayRemove(
              ...failedTokens
            ),
          });
        }
      }

      return null;
    } catch (error) {
      logger.error("Error sending notification:", error);
      return null;
    }
  }

  return null;
});
