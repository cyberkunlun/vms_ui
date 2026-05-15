<template>
  <el-dialog
    v-model="visible"
    :title="props.camera?.cameraName"
    :modal-append-to-body="false"
    custom-class="camera-dialog"
    destroy-on-close
  >
    <div class="video-container" v-loading="loading">
      <video ref="videoElements" autoplay muted playsinline controls class="native-video"></video>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import * as authUtil from '@/utils/auth'
import { config } from '@/utils/runtimeConfig'

const props = defineProps({
  modelValue: Boolean,
  camera: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const videoElements = ref(null)
const loading = ref(true)
const pcValue = ref(null)
const MAX_RETRY = 3
let retryCount = 0

const getVideoUrl = async () => {
  try {
    loading.value = true
    await nextTick()
    const video = videoElements.value
    let camera = props.camera

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: `${config.STUN_SERVER_URL}` },
        { urls: 'stun:stun.l.google.com:19302' }
      ],
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceCandidatePoolSize: 10
    })

    pcValue.value = pc

    const dataChannel = pc.createDataChannel('keepalive', {
      ordered: true,
      maxRetransmits: 3
    })

    dataChannel.onopen = () => {
      console.log('Data channel opened, sending keepalive')
      setInterval(() => {
        if (dataChannel.readyState === 'open') {
          dataChannel.send('keepalive')
        }
      }, 5000)
    }

    dataChannel.onmessage = (event) => {
      console.log('Received message:', event.data)
    }

    pc.addTransceiver('video', { direction: 'recvonly' })
    pc.addTransceiver('audio', { direction: 'recvonly' })

    pc.ontrack = (event) => {
      if (!video.srcObject) {
        video.srcObject = new MediaStream()
      }
      event.streams[0]?.getTracks()?.forEach((track) => {
        video.srcObject.addTrack(track)
      })
      loading.value = false
      video.muted = true
      video.playsInline = true
      video.autoplay = true
    }

    const sendSDPRequest = async (token, maxRetries = 10, retryDelay = 500) => {
      const sdpUrl = `${config.PLAY_SERVER_URL}/v0/cameras/${camera.id}/streams/1/sdp`

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await axios.post(
            sdpUrl,
            { session_id: token, sdp: pc.localDescription.sdp },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 15000
            }
          )

          let answerSdp = response.data.sdp

          if (answerSdp && !answerSdp.startsWith('v=')) {
            try {
              const decodedSdp = atob(answerSdp)
              if (decodedSdp.startsWith('v=')) {
                answerSdp = decodedSdp
              }
            } catch (decodeError) {
              console.warn('Base64 解码失败:', decodeError)
            }
          }

          if (!answerSdp || !answerSdp.startsWith('v=')) {
            throw new Error(`Invalid SDP: ${answerSdp ? answerSdp.substring(0, 50) + '...' : 'empty'}`)
          }

          await pc.setRemoteDescription({
            type: 'answer',
            sdp: answerSdp
          })
          return true
        } catch (error) {
          const errorMsg = error.response?.data?.error || error.message
          if (errorMsg.includes('camera not ready') && attempt < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
            continue
          }
          console.error('SDP request failed:', errorMsg)
          return false
        }
      }
    }

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        const url = `${config.PLAY_SERVER_URL}/v0/cameras/${camera.id}/streams/1`
        let token = camera.id + authUtil.getAccessToken()
        const data = {
          session_id: token,
          username: camera.cameraAccount,
          password: camera.cameraPassword,
          source_url: `rtsp://${camera.cameraIp}:${camera.cameraPort}`,
          retina_url: `rtsp://${camera.cameraAccount}:${camera.cameraPassword}@${camera.cameraIp}:${camera.cameraPort}`
        }

        axios
          .post(url, data, { headers: { 'Content-Type': 'application/json' } })
          .then(() => {
            sendSDPRequest(token)
          })
          .catch((err) => {
            console.error('POST failed:', err)
            if (retryCount < MAX_RETRY) {
              retryCount++
              setTimeout(() => { getVideoUrl() }, 30000)
            }
          })
      }
    }

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      await pc.setLocalDescription(offer)

      setTimeout(() => {
        if (pc.iceConnectionState === 'checking') {
          console.log('ICE connection taking too long, restarting...')
          pc.restartIce()
        }
      }, 30000)
    } catch (err) {
      console.error('Create offer failed:', err)
      loading.value = false
    }
  } catch (e) {
    console.error('Init video stream failed:', e)
  }
}

const destroyHls = () => {
  const pc = pcValue.value
  if (pc) {
    try { pc.close() } catch (e) { console.error('Close PC error:', e) }
  }
  const video = videoElements.value
  if (video && video.srcObject) {
    try {
      const tracks = video.srcObject.getTracks()
      tracks.forEach((track) => {
        track.stop()
        video.srcObject.removeTrack(track)
      })
      video.srcObject = null
    } catch (e) { console.error('Cleanup tracks error:', e) }
  }
  if (props.camera) {
    let token = props.camera.id + authUtil.getAccessToken()
    const url = `${config.PLAY_SERVER_URL}/v0/cameras/${props.camera.id}/streams/1?session_id=${token}`
    axios.delete(url).catch((err) => console.error('Del failed:', err))
  }
}

watch(visible, (val) => {
  if (val) { getVideoUrl() } else { destroyHls() }
})

onUnmounted(() => {})
</script>

<style scoped>
.video-container {
  position: relative;
  height: 60vh;
  overflow: hidden;
}

.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.native-video {
  width: 100%;
  height: calc(100% - 40px);
  object-fit: cover;
  background: #000;
  transform: translateZ(0);
}

:deep(.camera-dialog .el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
