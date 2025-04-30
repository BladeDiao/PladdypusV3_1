# 项目目录结构

- **backend**  

- **content-management-system**  

- **digital-compendium**  

- **website**  

- **data**
---

# 命名规则


## 一、文件与目录命名
- **一般文件**：统一采用小写字母，单词间用连字符 `-` 分隔（kebab-case）（`content-management-system`）。
- **组件文件**：采用 PascalCase（首字母大写，如 `UserProfile.jsx`）。

## 二、前后端 API 命名

### 1. API 路径命名
 **统一前缀类型**：API 路径以 `/用途/公开度/资源/操作` 
 - `用途:` user > analysis > area > adv = article >= venue > content
 - `公开程度:` public private root
 - `资源:` 具体的名称 永远是一个词 大词/中词/小词
 - `操作:` read create update delete

### 2. api内部参数命名
**字段和数据库内部实际保存一致**


## 三、数据库命名

### 2. 表名
- **风格**：使用单数下划线分隔（snake_case）：  
  - 示例：`user`、`article_entry`

### 3. 字段名称
 - **风格**：采用camelCase，但是所有的foreign key都是 `foreign表名_id`
 - `locationInfo`、`createdAt`
 -  `venue_id`、`user_id`
  

## 四、后端调用流程
 -  route -> controller(校验) -> service(sql写这里) -> model
 -  Route 层 将 HTTP 请求映射到 Controller 层。
 - Controller 层 负责处理请求参数、鉴权，调用 Service 层和返回响应。
 - Service 层 封装具体的业务逻辑和数据访问（包括 Redis 缓存处理）。


| 错误码 | 描述         | 说明                                     |
| ------ | ------------ | ---------------------------------------- |
| 400    | 参数错误     | 请求参数缺失、格式错误或数据验证失败       |
| 401    | 未授权       | 缺少或无效的认证信息                       |
| 403    | 权限错误     | 用户无操作权限，禁止访问该资源             |
| 404    | 资源不存在   | 请求的资源不存在或已被删除                 |
| 409    | 冲突错误     | 请求与当前资源状态冲突，例如重复提交或状态冲突 |
| 422    | 处理错误     | 请求参数逻辑错误或业务规则校验失败         |
| 500    | 内部逻辑错误 | 服务器内部错误，程序异常或逻辑处理错误       |
| 503    | 服务不可用   | 服务器暂时过载、维护中或依赖服务不可用       |


{
  "code": 500,
  "message": "internal error"   //这个是兜底
}