import { VoiceFocusDeviceTransformer, VoiceFocusTransformDevice } from "amazon-chime-sdk-js";
import { useEffect, useMemo, useState } from "react";
import { Duplex, DuplexOptions } from "readable-stream";
import MicrophoneStream from "microphone-stream";

const SampleRate = 44100
// const SampleRate = 48000


export type MediaRecorderState = {
    micMediaStream: MediaStream | undefined,
    vfMediaStream: MediaStream | undefined
}
export type MediaRecorderStateAndMethod = MediaRecorderState & {
    setNewAudioInputDevice: (deviceId: string) => Promise<void>

    startRecord: () => void
    pauseRecord: () => void
    clearRecordedData: () => void
    getRecordedDataBlobs: () => {
        micWavBlob: Blob;
        vfWavBlob: Blob;
    }
}

class AudioStreamer extends Duplex {
    chunks: Float32Array[] = []

    constructor(options?: DuplexOptions) {
        super(options);
    }

    private initializeData = () => {
        this.chunks = []
    }

    clearRecordedData = () => {
        this.initializeData()
    }

    getRecordedData = () => {
        const sampleSize = this.chunks.reduce((prev, cur) => {
            return prev + cur.length
        }, 0)
        const samples = new Float32Array(sampleSize);
        let sampleIndex = 0
        // this.chunks.forEach(floatArray => {
        //     floatArray.forEach(val => {
        //         samples[sampleIndex] = val
        //         sampleIndex++;
        //     })
        // })
        for (let i = 0; i < this.chunks.length; i++) {
            for (let j = 0; j < this.chunks[i].length; j++) {
                samples[sampleIndex] = this.chunks[i][j];
                sampleIndex++;
            }
        }

        console.log("samples:c2", this.chunks[0][0])
        console.log("samples:c2", this.chunks[0][1])
        console.log("samples:c2", this.chunks[0])
        console.log("samples:s", samples[0])
        console.log("samples:s", samples[1])
        console.log("samples:s", samples[2])
        console.log("samples:s", samples)

        const writeString = (view, offset, string) => {
            for (var i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        const floatTo16BitPCM = (output, offset, input) => {
            for (var i = 0; i < input.length; i++, offset += 2) {
                var s = Math.max(-1, Math.min(1, input[i]));
                output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        };


        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        writeString(view, 0, 'RIFF');  // RIFFヘッダ
        view.setUint32(4, 32 + samples.length * 2, true); // これ以降のファイルサイズ
        writeString(view, 8, 'WAVE'); // WAVEヘッダ
        writeString(view, 12, 'fmt '); // fmtチャンク
        view.setUint32(16, 16, true); // fmtチャンクのバイト数
        view.setUint16(20, 1, true); // フォーマットID
        view.setUint16(22, 1, true); // チャンネル数
        view.setUint32(24, SampleRate, true); // サンプリングレート
        view.setUint32(28, SampleRate * 2, true); // データ速度
        view.setUint16(32, 2, true); // ブロックサイズ
        view.setUint16(34, 16, true); // サンプルあたりのビット数
        writeString(view, 36, 'data'); // dataチャンク
        view.setUint32(40, samples.length * 2, true); // 波形データのバイト数
        floatTo16BitPCM(view, 44, samples); // 波形データ
        console.log(view)
        const audioBlob = new Blob([view], { type: 'audio/wav' });
        return audioBlob

        // var url = URL.createObjectURL(audioBlob);
        // // var a = document.createElement('a');
        // // a.href = url;
        // // a.download = 'test.wav';
        // // a.click();
        // // return this.chunks
        // return url
    }

    public _write(chunk: AudioBuffer, _encoding: any, callback: any) {
        const buffer = chunk.getChannelData(0);
        console.log("SAMPLERATE:", chunk.sampleRate, chunk.numberOfChannels, chunk.length)
        var bufferData = new Float32Array(chunk.length);
        for (var i = 0; i < chunk.length; i++) {
            bufferData[i] = buffer[i];
        }
        this.chunks.push(bufferData)
        callback();
    }
}

export const useMediaRecorder = (): MediaRecorderStateAndMethod => {
    const audioContext = useMemo(() => {
        return new AudioContext({ sampleRate: SampleRate });
    }, [])
    const [voiceFocusDeviceTransformer, setVoiceFocusDeviceTransformer] = useState<VoiceFocusDeviceTransformer>();
    useEffect(() => {
        VoiceFocusDeviceTransformer.create().then(t => { setVoiceFocusDeviceTransformer(t) })
    }, [])
    const [voiceFocusTransformDevice, setVoiceFocusTransformDevice] = useState<VoiceFocusTransformDevice | null>(null)
    const outputNode = useMemo(() => {
        return audioContext.createMediaStreamDestination();
    }, [])

    const [micMediaStream, setMicMediaStream] = useState<MediaStream>()
    const [vfMediaStream, setVfMediaStream] = useState<MediaStream>()

    const micAudioStreamer = useMemo(() => {
        return new AudioStreamer({ objectMode: true, })
    }, [])
    const micStream = useMemo(() => {
        const s = new MicrophoneStream({
            objectMode: true,
            bufferSize: 1024,
            context: audioContext
        });
        s.pipe(micAudioStreamer)
        return s
    }, [])

    const vfAudioStreamer = useMemo(() => {
        return new AudioStreamer({ objectMode: true, })
    }, [])
    const vfStream = useMemo(() => {
        const s = new MicrophoneStream({
            objectMode: true,
            bufferSize: 1024,
            context: audioContext
        })
        s.pipe(vfAudioStreamer)
        return s
    }, [])


    const setNewAudioInputDevice = async (deviceId: string) => {
        console.log("setNewAudioInputDevice", deviceId)

        if (!voiceFocusDeviceTransformer) {
            console.warn("voiceFocusDeviceTransformer is not initialized")
            return
        }
        if (micMediaStream) {
            micMediaStream.getTracks().forEach(x => {
                x.stop()
            })
        }

        const constraints: MediaStreamConstraints = {
            audio: {
                deviceId: deviceId,
                sampleRate: SampleRate,
                // sampleSize: 16,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
            },
            video: false
        }

        const newMicMediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        newMicMediaStream.getTracks().forEach(t => {
            console.log("Capability:", t.getCapabilities())
            console.log("Constraint:", t.getConstraints())
        })
        let currentDevice = voiceFocusTransformDevice
        if (!currentDevice) {
            currentDevice = (await voiceFocusDeviceTransformer.createTransformDevice(newMicMediaStream)) || null;
            setVoiceFocusTransformDevice(currentDevice)
        } else {
            currentDevice.chooseNewInnerDevice(newMicMediaStream)
        }

        const nodeToVF = audioContext.createMediaStreamSource(newMicMediaStream);

        const voiceFocusNode = await currentDevice!.createAudioNode(audioContext);
        nodeToVF.connect(voiceFocusNode.start);
        voiceFocusNode.end.connect(outputNode);

        setMicMediaStream(newMicMediaStream)
        setVfMediaStream(outputNode.stream)

        micStream.setStream(newMicMediaStream)
        micStream.pauseRecording()
        vfStream.setStream(outputNode.stream)
        vfStream.pauseRecording()
    }

    const startRecord = () => {
        micAudioStreamer.clearRecordedData()
        micStream!.playRecording()
        vfAudioStreamer.clearRecordedData()
        vfStream!.playRecording()
    }
    const pauseRecord = () => {
        micStream!.pauseRecording()
        vfStream!.pauseRecording()
    }
    const clearRecordedData = () => {
        micAudioStreamer.clearRecordedData()
        vfAudioStreamer.clearRecordedData()
    }
    const getRecordedDataBlobs = () => {
        const micWavBlob = micAudioStreamer.getRecordedData()
        const vfWavBlob = vfAudioStreamer.getRecordedData()
        return { micWavBlob, vfWavBlob }
    }

    const retVal: MediaRecorderStateAndMethod = {
        micMediaStream,
        vfMediaStream,
        setNewAudioInputDevice,

        startRecord,
        pauseRecord,
        clearRecordedData,
        getRecordedDataBlobs
    }

    return retVal

}