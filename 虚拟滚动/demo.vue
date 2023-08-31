<template>
    <view class="warning-container warning_index">
        <!-- 顶部标题及车牌号搜索 -->
        <u-navbar :is-back="true" is-fixed back-icon-color="#fff" title-color="#fff" :background="background" :title="title">
            <view class="slot-wrap">
                <u-icon
                    v-if="!useSlot"
                    style="padding-right: 30rpx; margin-left: auto"
                    size="40"
                    name="search"
                    color="#fff"
                    @click="handleShow"
                ></u-icon>
                <view class="search-wrap flex center" style="position: relative" v-if="useSlot">
                    <u-search
                        :value="keyword"
                        :show-action="true"
                        :clearabled="true"
                        height="56"
                        width="100%"
                        placeholder="请输入车牌号/自编号"
                        :action-style="{ color: '#fff' }"
                        @custom="search"
                        @focus="focusSearch"
                        @change="inputChange"
                    ></u-search>
                    <!-- <view class="back-warp" @click="search"> 搜索 </view> -->
                    <scroll-view  scroll-y class="car_list" v-if="showCarList" @scroll="handleScroll">
                        <u-empty mode="search" :icon-size="80" :font-size="24" v-if="carListTemp.length == 0"></u-empty>
                        <view class="car_list-long" :style="'height:'+itemHeight*carList.length+'px'" v-else>
                             <view class="car_list-viewport" :style="'top:'+top+'px'">
                                <view v-for="(v, i) in carListTemp" :key="i" class="list_style" @click="selectCar(v)">
                                    <text> {{ v }} </text>
                                </view>
                        </view>
                        </view>
                    </scroll-view>
                    <view class="mask" v-if="showCarList" @click="handleBlur"></view>
                </view>
            </view>
        </u-navbar>
        <!-- 下拉条件 -->
        <u-dropdown ref="uDropdown" class="warning-dropdown">
            <u-dropdown-item title="日期">
                 <view class="time-content">
                    <u-calendar
                        v-model="show"
                        @change="changeTime"
                        toolTip=" "
                        :border-radius="0"
                        :mask-close-able="false"
                        :closeable="false"
                        mode="range"
                        position="top"
                    ></u-calendar>
                    </view>
            </u-dropdown-item>
            <u-dropdown-item title="部门">
                <view class="time-content">
                    <luyj-tree :is-check="true" :trees="treeData" :parent="true" :props="props" @confirm="handleTreeOk" @change="handleTreeChecked">
                    </luyj-tree>
                     <!-- <xiaolu-tree
                        :checkList="checkList"
                        v-if="treeData.length > 0"
                        :props="props"
                        @sendValue="handleTreeOk"
                        :isCheck="true"
                        :treeNone="treeData"
                        keyValue="key"
                        :searchIf="false"
                    >
                    </xiaolu-tree> -->
                </view>
            </u-dropdown-item>
            <u-dropdown-item title="预警">
                <view class="slot-content">
                    <scroll-view scroll-y class="warning-list">
                        <template v-if="alarmtypeList.length > 0">
                            <view class="ccontent_item" v-for="(titem, tindex) in alarmtypeList" :key="tindex">
                                <template v-if="titem.children.length > 0">
                                    <view class="content_item-title flex" style="margin-top: 10rpx">
                                        <view>
                                            {{ titem.name }}
                                        </view>
                                        <view class="title-all-check" @tap="handleCheckAll(titem)">
                                            {{ titem.checkAll ? '取消全选' : '全选' }}
                                        </view>
                                    </view>
                                    <view class="item-box">
                                        <view class="item-col" v-for="(item, index) in titem.children" :key="index">
                                            <view
                                                class="item flex center"
                                                :class="[item.active ? 'active' : '']"
                                                :style="item.name.length > 10 ? cssOverflow : ''"
                                                @tap="tagClick(item, tindex)"
                                            >
                                                {{ item.name }}
                                            </view>
                                        </view>
                                    </view>
                                </template>
                            </view>
                        </template>
                        <u-empty v-else text="没有预警类型" mode="list"></u-empty>
                    </scroll-view>
                    <u-button type="primary" class="warning-btn" @click="closeDropdown">确定</u-button>
                </view>
            </u-dropdown-item>
        </u-dropdown>
        <!-- 已处理未处理 -->
        <u-tabs :list="menuList" active-color="#1491fb" :is-scroll="false" :current="current" @change="handleTabsChange"></u-tabs>
        <!-- 列表数据 -->

        <scroll-view 
        scroll-y 
        scroll-with-animation 
        class="global_list"  
        :scroll-top="scrollViewTop" 
        refresher-enabled="true" 
        :refresher-triggered="triggered"
        @scroll="scroll" 
        @scrolltolower="onreachBottom" 
        @refresherrefresh="onRefresh">
            <waves itemClass="custom" v-for="(item, index) in alarmList" :key="index" @onTap="toDetail(item)">
                <view class="right_item flex">
                    <view class="global_list-left">
                        <image :src="item.url" lazy-load style="width: 100%; height: 100%"></image>
                    </view>
                    <view class="global_list-right">
                        <view class="right_label-group flex">
                            <u-tag :text="item.alarmname" class="right_label-group_label noborder" type="primary" />
                            <u-tag :text="item.alarmlevelname" class="noborder" :type="$labelNameToColor(item.sortLevel)" />
                        </view>
                        <view class="right_line"> 驾 驶&nbsp;&nbsp;&nbsp;员：{{ item.drivernm || '-' }} </view>
                        <view class="right_line">
                            相关车辆：
                            {{ item.carnumber || '-' }}
                            {{ item.busselfid ? '(' + item.busselfid + ')' : '' }}
                        </view>
                        <view class="right_line"> 预警时间：{{ item.intime || '-' }} </view>
                        <view class="iconfont icon-yichuli deal" v-if="current == 1"></view>
                    </view>
                </view>
            </waves>
            <loading v-if="!isEmpty || isLoading" :status="loadStatus" />
            <empty v-if="isEmpty" />
        </scroll-view>
        <!-- 返回顶部 -->
        <u-back-top top="600" mode="square" :style="{ bottom: '80rpx' }" :scroll-top="scrollTop" @toTop="toTop"></u-back-top>
    </view>
</template>

<script>
import Empty from '@/components/empty'
import Loading from '../components/loading'
import { mapState } from 'vuex'
import waves from '@/components/waves/index.vue'
import api from '@/http'
export default {
    components: {
        Empty,
        waves,
        Loading,
    },
    computed: {
        ...mapState({
            userInfo: (state) => state.user.userInfo,
            alarmtypeList: (state) => state.user.alarmtypeList,
            /** 选中的部门id */
            checkedDeptIds: (state) => state.user.checkedDeptIds,
            /** 选中的预警 */
            checkedAlarm: (state) => state.user.checkedAlarm,
            /** 选中的级别 */
            checkedLevel: (state) => state.user.checkedLevel,
            /** 告警级别大类 */
            classifycd: (state) => state.user.classifycd
        }),
        show: {
            get: function () {
                return true
            },
            set: () => {}
        }
    },
    data() {
        return {
            checkList:[],
            props: {
                id: 'value',
                label: 'title',
                children: 'children',
                multiple: true,
                checkStrictly: true,
            },
            background: {
                backgroundColor: '#0084FF'
            },
            /** tabbar 标题 */
            title: '预警明细',
            /** 搜索值 */
            keyword: '',
            /** 开启插槽 */
            useSlot: false,
            /** 模糊查询 */
            showCarList: false,
            /** 结束查询 */
            endStatus: false,
            /**车牌号列表 */
            carListTemp: [],
            /** 标签栏 */
            menuList: [
                {
                    name: '未处理'
                },
                {
                    name: '已处理'
                }
            ],
            /** 查询条件 */
            queryParam: {
                pageNum: 1,
                pageSize: 10,
                beginTime: uni.dayjs().format('YYYY-MM-DD 00:00:00'),
                endTime: uni.dayjs().format('YYYY-MM-DD 23:59:59'),
                /**部门ID */
                createDids: '',
                /**线路ID */
                lineIds: '',
                /** 处理状态 01 已处理 02 未处理 */
                status: '01',
                /** 预警级别 */
                alarmlevel: '',
                /** 预警子类型 */
                alarmtype: '',
                /** 父预警类型 */
                classifycd: '',
                /** search 搜索条件 车牌号 */
                carnumber: '',
                /** 过滤误报 */
                checkres: '0,1'
            },
            /** tab下标 */
            current: 0,
            /** 树数据 */
            treeData: [],
            /** 预警列表数据 */
            alarmList: [],
            /** 线路选中的id */
            lineCheckedIds: [],
            /** 数据是否为空 */
            isEmpty: false,
            /** 是否加载 */
            isLoading: false,
            /** 是否加载 */
            triggered: false,
            /** loading状态 */
            loadStatus: 'loading',
            /** 总页数 */
            total: 0,
            scrollTop: 0,
            /**scrollview的顶部距离 */
            scrollViewTop: null,
            /** 车辆列表 */
            carList: [],
            scrollHeight: 0,
            cssOverflow: {
                overflow: 'hidden',
                'text-overflow': 'ellipsis',
                display: '-webkit-box',
                '-webkit-line-clamp': 2,
                /* autoprefixer: ignore next */
                '-webkit-box-orient': 'vertical'
            },
            showStart:0,
            itemHeight:60,
            num:20,
            top:0,

        }
    },
    onLoad() {
        var systemInfo = uni.getSystemInfoSync()
        this.scrollHeight =  systemInfo.statusBarHeight+170+88;
        if (this.userInfo.deptId == 100) {
            this.props = {
                id: 'value',
                label: 'title',
                children: 'children',
                checkStrictly: false,
                multiple: false,
                nodes: false
            }
        } else {
            this.props = {
                id: 'value',
                label: 'title',
                children: 'children',
                multiple: true,
                checkStrictly: true
            }
        }
        uni.showLoading({
            title: '加载中...',
            mask: true,
            icon: 'loading'
        })
        const deptTree = this.$store.state.user.deptTree
        this.alarmList = []
        // 初始化吧所有的部门id 取出来
        // this.deptCheckedIds = this.checkedDeptIds == null ? [...this.allDeptIds] : this.checkedDeptIds
        // console.log('111111111111111111', this.checkedDeptIds)
        if (this.checkedDeptIds.length == 1 && this.checkedDeptIds[0] == '100') {
            this.$store.commit('user/updateAlarmtypeList', [])
        }
        // console.log('checkedLevel', this.checkedLevel)
        this.queryParam.alarmlevel = this.checkedDeptIds.length == 1 && this.checkedDeptIds[0] == '100' ? '' : this.checkedLevel.join(',')
        this.queryParam.alarmtype = this.checkedDeptIds.length == 1 && this.checkedDeptIds[0] == '100' ? '' : this.checkedAlarm.join(',')
        this.queryParam.classifycd = this.checkedDeptIds.length == 1 && this.checkedDeptIds[0] == '100' ? '' : this.classifycd.join(',')
        this.queryParam.pageNum = 1
        this.treeData = deptTree
        this.getIDs()
        this.getCarList(this.checkedDeptIds)
        this.getRealAlarm(true)
    },
    methods: {
        handleScroll(e){
            const scrollTop = e.target.scrollTop
            this.top = scrollTop
            if(this.showStart!= Math.ceil(scrollTop / this.itemHeight)){
                this.showStart = Math.ceil(scrollTop / this.itemHeight)
                console.log(this.top,this.showStart)
                this.carListTemp = this.carList.slice(this.showStart,this.showStart+this.num)
            }
            // console.log(scrollTop)
        },
        handelBottomScroll(e){
            if(this.carList.length>this.showEnd&& !this.keyword){
                this.showEnd+=100
                this.carListTemp = this.carList.slice(this.showStart,this.showEnd)
            }
        },
        /** 获取车辆列表 */
        getCarList(array) {
            console.log('获取车辆列表', array)
            // 超级管理员 全是单选 所有不加s
            if (this.userInfo.deptId == 100) {
                var parm = {
                    createDid: array.join(',')
                }
            } else {
                var parm = {
                    createDids: array.join(',')
                }
            }
            api.getCarList(parm).then((res) => {
                let array = []
                if (res.length > 0) {
                    res.forEach((v) => {
                        if(v.number&& !v.busselfid){
                            array.push(v.number)
                        }else{
                            array.push(v.number+'('+v.busselfid+')')
                        }
                        
                    })
                    this.carList = Array.from(new Set(array))
                    this.carListTemp = this.carList.slice(this.showStart,this.showStart+this.num)
                } else {
                    this.carList = []
                }
            })
        },
        /** 递归树增加选中状态 */
        // deep(tree) {
        //     tree.forEach((item, index) => {
        //         tree[index].checked = true
        //         tree[index].halfChecked = false
        //         if ('children' in item) {
        //             this.deep(tree[index].children)
        //         }
        //     })
        //     return tree
        // },
        /**回到顶部 */
        toTop(v) {
            this.scrollViewTop = v
        },
        /**滚动监听 */
        scroll(e) {
            this.scrollTop = e.detail.scrollTop
        },
        /** 跳转预警详情 */
        toDetail(v) {
            this.$store.commit('alarm/getRecords', v)
           	uni.navigateTo({
					url: '/subPage/warning/detail?uuid=' + v.uuid
			})
        },
        /**显示搜索框 */
        handleShow() {
            this.useSlot = true
            if(!this.keyword){
                this.showEnd = 50
                this.carListTemp = this.carList.slice(this.showStart,this.showEnd)
            }
        },
        /**选中车 */
        selectCar(v) {
            if(v.includes('(')){
            const [carNumber] = v.split('(')
                this.keyword = carNumber
            }else{
                this.keyword = v
            }
            this.showCarList = false
        },
        /** 模糊查询 */
        inputChange(v) {
            if(!v){
                this.showEnd = 50
                this.carListTemp = this.carList.slice(this.showStart,this.showEnd)
            }else{
                this.carListTemp = this.carList.filter((item) => item.includes(v))
            }
            this.keyword = v

            
        },
       
        /** 获取焦点 */
        focusSearch(v) {
            this.showCarList = true
            this.$refs.uDropdown.close()
        },
        handleBlur(){
            this.showCarList = false
        },
        /**搜索 */
        search() {
            this.useSlot = false
            this.carListTemp = []
            this.queryParam.carnumber = this.keyword
            this.queryParam.pageNum = 1
            this.alarmList = []
            this.getRealAlarm()
        },
        /** 搜索事件 */
        handleSearch(v) {},
        /** 预警确定按钮事件 */
        closeDropdown() {
            this.resetSearch()
            this.$refs.uDropdown.close()
        },
        /**时间组件 */
        changeTime(e) {
            const day = uni.dayjs(e.endDate).diff(uni.dayjs(e.startDate), 'days')
            if (this.userInfo.deptId == 100) {
                if (day < 14) {
                    this.queryParam.beginTime = e.startDate + ' 00:00:00'
                    this.queryParam.endTime = e.endDate + ' 23:59:59'
                    this.$refs.uDropdown.close()
                    this.resetSearch()
                } else {
                    uni.showToast({
                        title: '请选择14天内的时间区间',
                        icon: 'none'
                    })
                }
            } else {
                if (day < 31) {
                    this.queryParam.beginTime = e.startDate + ' 00:00:00'
                    this.queryParam.endTime = e.endDate + ' 23:59:59'
                    this.$refs.uDropdown.close()
                    this.resetSearch()
                } else {
                    uni.showToast({
                        title: '请选择31天内的时间区间',
                        icon: 'none'
                    })
                }
            }
        },
        /** 树确定 */
        handleTreeOk(v) {
             if (v.length == 0) {
                uni.showToast({
                    title: '请选择部门',
                    icon: 'none'
                })
                return
            }
            this.$refs.uDropdown.close()
            console.log('部门树选中', v)
            this.$store.commit('user/setCheckedDeptes', v)
            this.getCarList(v)
            if (v[0] == 100) {
                this.queryParam.alarmlevel = ''
                this.queryParam.alarmtype = ''
                this.queryParam.classifycd = ''
                this.queryParam.createDids = v[0]
                this.$store.commit('user/updateAlarmtypeList', [])
                this.resetSearch()
            } else {
                this.$store.dispatch('user/getAlarmList', v[0]).then((res) => {
                    this.queryParam.classifycd = this.classifycd.join(',')
                    // 查询接口
                    this.resetSearch()
                })
            }
            // xiaoluTree version
            // this.checkList = v
            // if (v.length == 0) {
            //     uni.showToast({
            //         title: '请选择部门',
            //         icon: 'none'
            //     })
            //     return
            // }
            // this.$refs.uDropdown.close()
            // let depIds = v.map(item=>item.value)
            // this.$store.commit('user/setCheckedDeptes', depIds)
            // this.getCarList(depIds)
            // if (depIds[0] == 100) {
            //     this.queryParam.alarmlevel = ''
            //     this.queryParam.alarmtype = ''
            //     this.queryParam.classifycd = ''
            //     this.queryParam.createDids = depIds[0]
            //     this.$store.commit('user/updateAlarmtypeList', [])
            //     this.resetSearch()
            // } else {
            //     this.$store.dispatch('user/getAlarmList', depIds[0]).then((res) => {
            //         this.queryParam.classifycd = this.classifycd.join(',')
            //         // 查询接口
            //         this.resetSearch()
            //     })
            // }
        },

        /** 部门树选中 */
        handleTreeChecked(v) {
            this.$store.commit('user/setCheckedDeptes', v)
            if (v[0] == 100) {
                this.queryParam.alarmlevel = ''
                this.queryParam.alarmtype = ''
                this.queryParam.classifycd = ''
                this.queryParam.createDids = v[0]
                this.$store.commit('user/updateAlarmtypeList', [])
            }
        },

        /** tabs切换 */
        handleTabsChange(v) {
            if (this.isLoading) return
            this.current = v
            this.alarmList = []
            setTimeout(() => {
                this.queryParam.status = v ? '02' : '01'
                this.queryParam.pageNum = 1
                this.isLoading = false
                this.getRealAlarm()
            }, 300)
        },
        /** 滚动触底 */
        onreachBottom() {
            console.log('滚动',this.isLoading)
            if(this.isLoading){
                return 
            }
            const result = this.dealMoreOrNone( this.queryParam.pageSize)
            if (result) {
                // 开启底部loading
                this.getRealAlarm(true)
            }
        },
        /**下拉刷新 */
        onRefresh() {
            this.triggered = true;
            this.resetSearch()
        },
        /** 判断显示loading还是没有更多了
         * pageNum 第几页
         * pageSize 每页多少条
         */
        dealMoreOrNone( pageSize) {
            // this.isLoading = true
            if (pageSize < this.total && !this.isLoading) {
                // 说明还有
                this.queryParam.pageNum = 1
                this.queryParam.pageSize = pageSize+10
                this.loadStatus = 'loading'
                console.log('还有更多')
                return true
            } else {
                // 没有更多
                console.log('没有更多了')
                this.loadStatus = 'nomore'
                return false
            }
        },

        /** 重置搜索条件 */
        resetSearch() {
            this.queryParam.pageNum = 1
            this.queryParam.pageSize = 10
            this.alarmList = []
            this.getRealAlarm()
        },
        /** 获取实时预警列表
         * isScroll 滚动触底
         */
        getRealAlarm(isScroll = false) {
            if (!isScroll) {
                uni.showLoading({
                    title: '加载中...',
                    mask: true,
                    icon: 'loading'
                })
            }
            if (this.checkedDeptIds.length == 0) {
                uni.showToast({
                    title: '请选择部门',
                    icon: 'none'
                })
                return
            }

            let params = {
                ...this.queryParam,
                createDids: this.checkedDeptIds.toString(),
                lineIds: this.lineCheckedIds.toString()
            }
            this.isLoading = true
            api.realAlarmList({
                ...params
            }).then((res) => {
                if (res.records.length > 0) {
                    res.records.forEach((v) => {
                        this.$set(v, 'url', this.mediasToImg(v.medias))
                    })
                }
                this.alarmList =res.records
                this.total = res.total
                this.isEmpty = res.records.length > 0 ? false : true
                // this.dealMoreOrNone(pageNum, pageSize)
                uni.hideLoading()
                this.isLoading = false
                this.triggered = false
            })
        },
        /**根据媒体数组找图片 */
        mediasToImg(medias) {
            const noImg = 'https://jhx-wnx.oss-cn-hangzhou.aliyuncs.com/app_images/images/noMsg.png'
            const mediaType = ['jpg', 'png']
            if (medias.length == 0) {
                return noImg
            }
            const current = medias.find((item) => mediaType.includes(item.mediaext))
            if (current) {
                let imgUrl = current.mediaUrl.includes('wx.jinhx.cn')?
                current.mediaUrl.replace('wx.jinhx.cn','szxc.wxbus.com.cn'):
                current.mediaUrl.replace('wxfile.jinhx.cn','szxc.wxbus.com.cn/minio')
                return imgUrl
            } else {
                return noImg
            }
        },
        /**全选 */
        handleCheckAll(titem) {
            titem.checkAll = !titem.checkAll
            titem.children.forEach((v) => {
                this.$set(v, 'active', titem.checkAll)
            })
            this.getIDs()
        },
        /**单选 */
        tagClick(item, index) {
            item.active = !item.active
            // 判断是否全选和非全选
            this.alarmtypeList[index].children.every((item) => item.active)
                ? this.$set(this.alarmtypeList[index], 'checkAll', true)
                : this.$set(this.alarmtypeList[index], 'checkAll', false)
            this.getIDs()
        },
        /**获取最终请求ID */
        getIDs() {
            let level = []
            let alarm = []
            this.alarmtypeList.forEach((v, i) => {
                if (i == 0) {
                    //告警级别
                    v.children.forEach((item) => {
                        item.active && level.push(item.value)
                    })
                    this.queryParam.alarmlevel = level.join(',')
                    this.$store.commit('user/setCheckedLevel', level)
                } else {
                    //告警类型
                    v.children.forEach((item) => {
                        item.active && alarm.push(item.value)
                    })
                    this.queryParam.alarmtype = alarm.join(',')
                    this.$store.commit('user/setCheckedAlarm', alarm)
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.warning-container {
    height: 100%;
    overflow: hidden;
    background-color: $parimary-background-color;
    display: flex;
    flex-direction: column;
}

.warning-dropdown {
    background: #fff;
    flex:unset
}

.slot-wrap {
    display: flex;
    align-items: center;
    flex: 1;
}

.search-wrap {
    margin: 0 20rpx;
    flex: 1;
}

.back-warp {
    color: #fff;
    padding: 0 20rpx;
}

.slot-content {
    background-color: #ffffff;
    padding: 24rpx;

    .content_item {
        &-title {
            font-size: 32rpx;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20rpx;

            .title-all-check {
                border: 1px solid $parimary-color;
                color: $parimary-color;
                padding: 5rpx 20rpx;
                border-radius: 8rpx;
            }
        }
    }

    .item-box {
        margin-bottom: 50rpx;
        display: flex;
        flex-wrap: wrap;
        margin: 0 -10rpx;

        .item-col {
            width: 25%;
            padding: 0 10rpx;
        }

        .item {
            border: 1px solid $parimary-background-color;
            background: $parimary-background-color;
            color: $text-desc-light;
            padding: 8rpx 4rpx;
            border-radius: 16rpx;
            margin: 6rpx 0;
            text-align: center;
            height: 84rpx;
        }

        .active {
            color: #fff;
            background-color: $parimary-color;
        }
    }
}

.global_list {
    background: #fff;
    flex:1
}

.warning-list {
    height: 50vh;
    overflow: auto;
}

.warning-btn {
    margin-top: 10px;
}

.time-content {
    background-color: #fff;
}



.car_list {
    position: absolute;
    background: #fff;
    padding: 0 0 0 20rpx;
    width: 100%;
    max-height: 400rpx;
    top: 60rpx;
    left: 0;
    z-index: 999;
    border-radius: 10rpx;
    @include bxshadow;
    .car_list-long{
        position: relative;
    }
    .car_list-viewport{
        position: absolute;
    }
    .list_style {
        // margin: 20rpx 0;
        height: 60rpx;
    }
}
.mask{
    position: fixed;
    top: 10%;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.2);
    height: 100%;
    width: 100%;
}
</style>
