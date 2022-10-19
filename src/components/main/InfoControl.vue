<template>
  <div class="info_control">
    <el-config-provider :locale="locale">
      <el-table
        :data="
          filterTableData.slice(
            (currentpage - 1) * pagesize,
            currentpage * pagesize
          )
        "
        height="250"
        style="width: 100vw; height: 85vh"
        lazy
        class="table"
        ref="table"
      >
        <el-table-column prop="studentId" label="学号" width="90" />
        <el-table-column prop="departments" label="学院" width="180" />
        <el-table-column prop="major" label="专业" width="200" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" />

        <el-table-column prop="address" label="家庭住址" />

        <el-table-column prop="operate" label="操作">
          <template #header>
            <el-input
              v-model="search"
              size="small"
              placeholder="输入关键字查找"
            />
          </template>
          <template #default="scope">
            <el-button type="primary" @click="opendialog(scope.$index)"
              >修改</el-button
            >
            <el-button type="danger" @click.prevent="deleteRow(scope.$index)">
              删除
            </el-button>
          </template></el-table-column
        >
      </el-table>
    </el-config-provider>

    <el-pagination
      ref="page"
      :page-size="pagesize"
      :pager-count="11"
      :currentpage="currentpage"
      layout="prev, pager, next"
      :total="filterTableData.length"
      @current-change="currentChange"
    >
    </el-pagination>

    <el-dialog v-model="dialogTableVisible" title="修改学生信息">
      <el-form
        :label-position="labelPosition"
        ref="changeRowFormRef"
        label-width="10vw"
        :rules="changeRowInfo_rules"
        :model="changeRowInfo"
        style="width: 20vw"
      >
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="changeRowInfo.studentId" disabled></el-input>
        </el-form-item>
        <el-form-item label="学院" prop="departments">
          <el-input v-model="changeRowInfo.departments"></el-input>
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="changeRowInfo.major"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="changeRowInfo.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="changeRowInfo.phone"></el-input>
        </el-form-item>
        <el-form-item label="家庭住址" prop="address">
          <el-input v-model="changeRowInfo.address"></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="changeRow(changeRowFormRef)">
        确认修改<el-icon class="el-icon--right"><Upload /></el-icon>
      </el-button>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { Upload } from "@element-plus/icons-vue";
import axios from "axios";
import { ElForm, ElMessage, ElMessageBox } from "element-plus";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import { computed, nextTick, onMounted, reactive, Ref, ref } from "vue";
import { getrequest } from "../../network/login/login";
let tableData: any = reactive([]);
let locale = zhCn;
let pagesize = ref(18);
let currentpage = ref(1);
let table = ref();
const currentChange = function (newPage: number) {
  nextTick(() => {
    currentpage.value = newPage;
  });
};
// 学生信息存储
getrequest("/gradeAll").then((res) => {
  tableData.push(...res.data);
});

//搜索模块
const search = ref("");
const filterTableData = computed(() =>
  tableData.filter(
    (data: any) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase()) ||
      data.studentId.toLowerCase().includes(search.value.toLowerCase()) ||
      data.address.toLowerCase().includes(search.value.toLowerCase()) ||
      data.departments.toLowerCase().includes(search.value.toLowerCase()) ||
      data.major.toLowerCase().includes(search.value.toLowerCase()) ||
      data.phone.toLowerCase().includes(search.value.toLowerCase())
  )
);

// 修改信息模块
const changeRowFormRef = ref<InstanceType<typeof ElForm>>();
const labelPosition = ref("right");
//修改信息模块->校验规则
const changeRowInfo_rules = reactive({
  studentId: [
    {
      required: true,
      message: "请输入修改后的学号",
      trigger: "blur",
    },
    {
      min: 8,
      max: 8,
      message: "学号必须是8位",
      trigger: "blur",
    },
  ],
  departments: {
    required: true,
    message: "学院名不能为空",
    trigger: "blur",
  },
  major: {
    required: true,
    message: "专业名不能为空",
    trigger: "blur",
  },
  name: {
    required: true,
    message: "姓名不能为空",
    trigger: "blur",
  },
  phone: [
    {
      required: true,
      message: "手机号不能为空",
      trigger: "blur",
    },
    {
      min: 11,
      max: 11,
      message: "手机号必须是11位",
      trigger: "blur",
    },
  ],
  address: [
    {
      required: true,
      message: "学生地址不能为空",
      trigger: "blur",
    },
  ],
});
const dialogTableVisible = ref(false);

const changeRowInfo = reactive({
  studentId: "",
  departments: "",
  major: "",
  name: "",
  phone: "",
  address: "",
});
let currentindex: any = ref(null);
const opendialog = (index: number) => {
  dialogTableVisible.value = true;
  currentindex.value = index;
  //点击进入更改页面时先清空上次数据
  changeRowInfo.studentId = tableData[currentindex.value].studentId;
  changeRowInfo.name = "";
  changeRowInfo.address = "";
  changeRowInfo.major = "";
  changeRowInfo.departments = "";
  changeRowInfo.phone = "";
};
const changeRow = (formEl: InstanceType<typeof ElForm> | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      axios
        .post("http://124.222.107.29:5000/admin/modify", {
          studentId: changeRowInfo.studentId,
          name: changeRowInfo.name,
          departments: changeRowInfo.departments,
          major: changeRowInfo.major,
          address: changeRowInfo.address,
          phone: changeRowInfo.phone,
        })
        .then(
          (res) => {
            tableData[currentindex.value].studentId = changeRowInfo.studentId;
            tableData[currentindex.value].name = changeRowInfo.name;
            tableData[currentindex.value].address = changeRowInfo.address;
            tableData[currentindex.value].major = changeRowInfo.major;
            tableData[currentindex.value].departments =
              changeRowInfo.departments;
            tableData[currentindex.value].phone = changeRowInfo.phone;
          },
          (err) => {
            ElMessage.error({
              message: "修改失败,请检查网络设置",
            });
          }
        );

      dialogTableVisible.value = false;
    } else {
      return false;
    }
  });
};
// 删除学生信息模块
const deleteRow = (index: number) => {
  ElMessage.closeAll();
  ElMessageBox.confirm(
    `请确认是否删除学生 <strong>${tableData[index].name}</strong> 的相关信息`,
    "警告",
    {
      confirmButtonText: "确认删除",
      cancelButtonText: "取消",
      type: "warning",
      center: true,
      dangerouslyUseHTMLString: true,
    }
  )
    .then(() => {
      axios
        .post(
          `http://124.222.107.29:5000/admin/del/${tableData[index].studentId}`
        )
        .then(
          (res) => {
            tableData.splice(index, 1);

            ElMessage.closeAll();
            ElMessage({
              type: "success",
              message: "删除成功",
            });
          },
          (err) => {
            ElMessage.error({
              message: "删除失败,请检查网络设置",
            });
          }
        );
    })
    .catch(() => {
      ElMessage.closeAll();
      ElMessage({
        type: "info",
        message: "已取消",
      });
    });
};
</script>
<style lang="less" scoped>
:deep(.el-dialog) {
  width: 30vw;
}
.info_control {
  margin-top: 1.5vh;
  width: 97%;
  margin-left: 0.5vw;
}
</style>
