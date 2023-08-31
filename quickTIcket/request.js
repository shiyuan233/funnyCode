const userInfo = require('./userInfo.json')
const axios = require('axios')
let hospitalId = 'dn66z4gx7pabcwytdx7g5ickb4',
  patientId = userInfo.patientId

let request = axios.create({
  baseURL: 'https://mp.guizhizhongyi.com/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    Authorization: userInfo['Authorization'],
  },
})

// 获取医院信息
function getHospitalInfo() {
  return request.get(
    'mp/common/hospitals/dn66z4gx7pabcwytdx7g5ickb4/info?parent_id='
  )
}

// 获取病人信息

function getPatient() {
  return request.get(
    `mp/common/hospitals/${hospitalId}/patients/${patientId}/docs`
  )
}

// 获取医生信息

function getDoctorList() {
  return request.get(
    `mp/common/hospitals/${hospitalId}/patients/${patientId}/all-doctor`
  )
}

getHospitalInfo().then((res) => {
  // console.log(res.data.data.info)
  let info = res.data.data.info
  if (info.name === '镇江上医堂') {
    hospitalId = info.id
  } else {
    throw new Error('医院错误')
  }
  // console.log(hospitalId, patientId)
})

// 获取当前医师是否有号
function getDoctorResidueNumber(doctor_id, day) {
  return request.get(
    `mp/common/hospitals/${hospitalId}/patients/${patientId}/doctor-appointment-day-time-interval-new?doctor_id=${doctor_id}&day=${day}&inquiry_type=1`
  )
}

// 获取医生状态
function getDoctorStatusInfo(doctor_id) {
  return request.get(
    `mp/common/hospitals/${hospitalId}/patients/${patientId}/doctor-appointment-day?doctor_id=${doctor_id}`
  )
}
// 排队
function sendInfo(data) {
  return request.post(
    `mp/common/hospitals/${hospitalId}/patients/${patientId}/appointments`,
    data
  )
}
// 获取排队信息
module.exports = {
  getHospitalInfo,
  getPatient,
  getDoctorList,
  getDoctorResidueNumber,
  getDoctorStatusInfo,
  sendInfo,
}
