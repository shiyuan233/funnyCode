const userInfo = require('./userInfo.json')
const moment = require('moment')
const {
  getHospitalInfo,
  getPatient,
  getDoctorList,
  getDoctorStatusInfo,
  getDoctorResidueNumber,
  sendInfo,
} = require('./request')
let timeDict = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-11:30',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
]
let count = 0
let payload = {
  doctor_id: 'kgvx2orpcybkxvxxteixgaaqe4',
  patient_doc_id: '',
  inquiry_day: '',
  inquiry_time: '',
  price: 0,
  condition_desc: '',
  inquiry_type: 1,
  pics: [],
  inquiry_way: 0,
  diagnosis_price: 0,
}

function check() {
  console.log('check 启动')
  getDoctorResidueNumber(payload.doctor_id, payload.inquiry_day).then((res) => {
    console.log(res.data.data)
    console.log(count)
    if (res.data.data.length == 0) {
      count++
      if (count < 5) {
        check()
      }
      return
    }
    let timeResidue = res.data.data.time_interval
    // 优先走期望时间 如果期望时间号满了 就走默认
    if (
      timeResidue[userInfo.expectedTime].is_full !== 1 &&
      timeResidue[userInfo.expectedTime].remain_num > 0
    ) {
      payload.inquiry_time = timeResidue[userInfo.expectedTime].interval
      console.log(
        '当前可预约时间：',
        timeResidue[userInfo.expectedTime].interval
      )
    } else {
      for (let time of timeResidue) {
        if (time.is_full !== 1 && time.remain_num > 0) {
          payload.inquiry_time = time.interval
          console.log('当前可预约时间：', time.interval)
          count = 6
          break
        }
      }
    }

    if (payload.inquiry_time === '') {
      count = 6
      throw new Error('当前医生已满，请选择其他医生')
    }
    console.log('确定参数', payload)
    clearInterval(times)
    // 开始排队
    sendInfo(payload)
      .then((res) => {
        console.log(res.data)
      })
      .catch((err) => {
        // console.log(err.response.data)
        let error = err.response.data
        console.log(error.message)
      })
  })
}

async function wait() {
  console.log('wait 启动')
  await getDoctorList().then((res) => {
    // console.log(res.data.data)
    let doctorsList = res.data.data
    for (let doctor of doctorsList) {
      if (doctor.name === userInfo.doctorName) {
        payload.doctor_id = doctor.doctor_id
        console.log('当前所选医师为：', doctor.name, doctor.doctor_id)
        break
      }
    }
  })

  await getPatient().then((res) => {
    if (res.data.data.length == 0) {
      throw new Error('请先创建病人信息')
    }
    let patientInfo = res.data.data[0]
    payload.patient_doc_id = patientInfo.id
    console.log('当前病人', patientInfo.name, patientInfo.id)
    // console.log(payload)
  })
  await getDoctorStatusInfo(payload.doctor_id).then((res) => {
    let doctorOnlineInfo = res.data.data[0]
    // if (doctorOnlineInfo.is_full === 1) {
    //   throw new Error('当前医生已满，请选择其他医生')
    // }
    payload.inquiry_day = doctorOnlineInfo.day
    console.log('当前医师在线日期为', doctorOnlineInfo.day)
  })
}

let currentTime = moment(userInfo.time)
let time = moment()
// 极速版
// while (true) {
// time = moment()
// console.log('等待中...',time.format('YYYY-MM-DD HH:mm:ss'))
// if (time > currentTime) {
//   console.log('启动！')
//   wait()
//   check()
//   return
// }
// }
// 每秒
let times = setInterval(() => {
  time = moment()
  console.log('等待中...', time.format('YYYY-MM-DD HH:mm:ss'))
  if (time < currentTime) {
    console.log('启动！')
    wait()
    check()
    return
  }
}, 1000)
