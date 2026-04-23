import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

const CREDIT_COST = 5;
const PROCESSING_DELAY_MS = 15000;

// Sample output URL – replace with real AI face swap API call
const SAMPLE_OUTPUT_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

interface GenerateVideoData {
  templateId: string;
  faceUrl: string;
}

export const generateVideo = functions.https.onCall(
  async (data: GenerateVideoData, context) => {
    // Auth check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const uid = context.auth.uid;
    const { templateId, faceUrl } = data;

    if (!templateId || !faceUrl) {
      throw new functions.https.HttpsError('invalid-argument', 'templateId and faceUrl are required');
    }

    // Get user and check credits
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userSnap.data() as { credits: number; email: string };
    if (userData.credits < CREDIT_COST) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Insufficient credits. Need ${CREDIT_COST}, have ${userData.credits}`
      );
    }

    // Deduct credits
    await userRef.update({ credits: admin.firestore.FieldValue.increment(-CREDIT_COST) });

    // Create video document
    const videoRef = await db.collection('videos').add({
      user_id: uid,
      template_id: templateId,
      face_url: faceUrl,
      output_url: '',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Simulate async processing (non-blocking)
    simulateProcessing(videoRef.id, uid, templateId, faceUrl);

    return { videoId: videoRef.id, status: 'pending' };
  }
);

async function simulateProcessing(
  videoId: string,
  uid: string,
  templateId: string,
  faceUrl: string
): Promise<void> {
  const videoRef = db.collection('videos').doc(videoId);

  // Mark as processing
  await videoRef.update({ status: 'processing' });

  await delay(PROCESSING_DELAY_MS);

  try {
    // In production: call a real face swap API here
    // e.g. const result = await callFaceSwapAPI({ templateId, faceUrl });
    // For now, return a sample video URL
    const outputUrl = SAMPLE_OUTPUT_URL;

    await videoRef.update({
      status: 'completed',
      output_url: outputUrl,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`Video ${videoId} completed for user ${uid}`);
  } catch (err) {
    functions.logger.error(`Video ${videoId} failed:`, err);
    await videoRef.update({ status: 'failed' });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
