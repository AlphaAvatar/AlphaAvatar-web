"use client";

import { RoomEvent } from "livekit-client";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  LocalParticipant,
  RemoteParticipant,
  Room,
} from "livekit-client";
import type { RuntimeEvent } from "./types";
import { BARS, getAgentParticipant, normalizeAgentStatusPayload } from "./utils";

type VideoTrackPublicationLike = {
  track?: {
    mediaStreamTrack?: MediaStreamTrack;
  } | null;
  isMuted: boolean;
};

export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

export function useRoomRefresh(room: Room | undefined) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!room) return;

    const bump = () => setVersion((v) => v + 1);

    const events = [
      "connectionStateChanged",
      "participantConnected",
      "participantDisconnected",
      "trackPublished",
      "trackUnpublished",
      "trackSubscribed",
      "trackUnsubscribed",
      "localTrackPublished",
      "localTrackUnpublished",
      "mediaDevicesChanged",
      "activeSpeakersChanged",
      "trackMuted",
      "trackUnmuted",
    ];

    events.forEach((event) => room.on(event as any, bump));
    bump();

    return () => {
      events.forEach((event) => room.off(event as any, bump));
    };
  }, [room]);

  return version;
}

export function useAgentAvailability(room: Room | undefined) {
  useRoomRefresh(room);

  const agentParticipant = getAgentParticipant(room);
  const remoteCount = room?.remoteParticipants.size ?? 0;

  return {
    agentParticipant,
    hasAgent: Boolean(agentParticipant),
    remoteCount,
  };
}

export function useParticipantVideoTrack(
  participant: LocalParticipant | RemoteParticipant | undefined,
  version: number
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const publication = useMemo<VideoTrackPublicationLike | undefined>(() => {
    if (!participant) return undefined;

    // LiveKit mutates publications inside the same participant object.
    // Keep version as an explicit refresh signal for memo recalculation.
    void version;

    const publications =
      participant.videoTrackPublications.values() as unknown as Iterable<VideoTrackPublicationLike>;

    for (const pub of publications) {
      if (pub.track && !pub.isMuted) {
        return pub;
      }
    }

    return undefined;
  }, [participant, version]);

  useEffect(() => {
    const el = videoRef.current;
    const track = publication?.track;

    if (!el || !track?.mediaStreamTrack) return;

    const stream = new MediaStream([track.mediaStreamTrack]);
    el.srcObject = stream;

    void el.play().catch((err) => {
      console.warn("[AlphaAvatar] video play failed:", err);
    });

    return () => {
      if (el.srcObject === stream) {
        el.srcObject = null;
      }
    };
  }, [publication]);

  return {
    videoRef,
    hasVideo: Boolean(publication?.track && !publication?.isMuted),
  };
}

export function useAgentAudioLevels(
  participant: RemoteParticipant | undefined,
  version: number
) {
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: BARS }, () => 0.25)
  );

  useEffect(() => {
    const publication = participant
      ? Array.from(participant.audioTrackPublications.values()).find(
          (pub) => pub.track && !pub.isMuted
        )
      : undefined;

    const mediaTrack = (publication?.track as any)?.mediaStreamTrack as
      | MediaStreamTrack
      | undefined;

    if (!mediaTrack) {
      setLevels(Array.from({ length: BARS }, () => 0.18));
      return;
    }

    let disposed = false;
    let raf = 0;
    let lastUpdate = 0;

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.72;

    const stream = new MediaStream([mediaTrack]);
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    void audioContext.resume().catch(() => {
      // Browser may wait until user gesture. RoomAudioRenderer still plays audio.
    });

    const tick = (now: number) => {
      if (disposed) return;

      analyser.getByteFrequencyData(data);

      if (now - lastUpdate > 40) {
        lastUpdate = now;

        const next = Array.from({ length: BARS }, (_, i) => {
          const start = Math.floor((i / BARS) * data.length * 0.68);
          const end = Math.floor(((i + 1) / BARS) * data.length * 0.68);
          const slice = data.slice(start, Math.max(start + 1, end));
          const avg =
            slice.reduce((sum, value) => sum + value, 0) / slice.length / 255;

          const centerBoost = 1 - Math.abs(i - Math.floor(BARS / 2)) / BARS;
          const shaped = Math.min(1, avg * 2.2 + centerBoost * 0.08);

          return Math.max(0.12, shaped);
        });

        setLevels(next);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close().catch(() => {});
    };
  }, [participant, version]);

  return levels;
}

export function useLocalAudioActivity(
  participant: LocalParticipant | undefined,
  version: number,
  enabled: boolean
) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!enabled || !participant) {
      setLevel(0);
      return;
    }

    const publication = Array.from(
      participant.audioTrackPublications.values()
    ).find((pub) => pub.track && !pub.isMuted);

    const mediaTrack = (publication?.track as any)?.mediaStreamTrack as
      | MediaStreamTrack
      | undefined;

    if (!mediaTrack) {
      setLevel(0);
      return;
    }

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      setLevel(0);
      return;
    }

    let disposed = false;
    let raf = 0;
    let lastUpdate = 0;

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.65;

    const stream = new MediaStream([mediaTrack]);
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);

    void audioContext.resume().catch(() => {
      // Browser may wait until user gesture.
    });

    const tick = (now: number) => {
      if (disposed) return;

      analyser.getByteTimeDomainData(data);

      if (now - lastUpdate > 45) {
        lastUpdate = now;

        let sum = 0;

        for (const value of data) {
          const centered = value - 128;
          sum += centered * centered;
        }

        const rms = Math.sqrt(sum / data.length) / 128;

        // 放大一点，让 UI 反馈更明显，同时避免环境底噪一直跳动
        const shaped = rms < 0.018 ? 0 : Math.min(1, rms * 7.5);

        setLevel(shaped);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close().catch(() => {});
    };
  }, [participant, version, enabled]);

  return {
    level,
    isSpeaking: level > 0.12,
  };
}

export function useRuntimeStatusEvents(
  room: Room | undefined,
  maxEvents = 20
) {
  const [events, setEvents] = useState<RuntimeEvent[]>([]);

  useEffect(() => {
    if (!room) {
      setEvents([]);
      return;
    }

    const decoder = new TextDecoder();

    const onDataReceived = (
      payload: Uint8Array,
      _participant?: RemoteParticipant,
      _kind?: unknown,
      topic?: string
    ) => {
      if (topic !== "agent.status.action") {
        return;
      }

      try {
        const parsed = JSON.parse(decoder.decode(payload));
        const event = normalizeAgentStatusPayload(parsed, Date.now());

        if (!event) return;

        setEvents((current) => {
          const duplicated = current.some((item) => {
            return (
              item.source === event.source &&
              item.stage === event.stage &&
              item.statusType === event.statusType &&
              item.title === event.title &&
              Math.abs(item.createdAt - event.createdAt) < 1200
            );
          });

          if (duplicated) return current;

          return [event, ...current].slice(0, maxEvents);
        });
      } catch (err) {
        console.warn("[AlphaAvatar] failed to parse runtime status event:", err);
      }
    };

    room.on(RoomEvent.DataReceived, onDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, onDataReceived);
    };
  }, [room, maxEvents]);

  return events;
}
