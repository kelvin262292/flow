# Cursor Rules 整理工具

这个项目用于整理和收集来自不同项目的Cursor规则文件，提供多种编程语言和框架的规则支持。

## 项目简介

Cursor是一款AI辅助编程工具，它使用规则文件来指导其行为。本项目的目标是收集、整理和标准化这些规则文件，使开发者能够更有效地利用Cursor进行开发工作。

参考文章教程：

[Cursor Rules 进阶指南：打造企业级多语言开发规范](https://mp.weixin.qq.com/s/rfanrMtMMuyUTwsDYmlxSg)

[Cursor Rules 最佳实践总结](https://mp.weixin.qq.com/s/-J_LwfwH9rmFy4dzEy0RXg)


## 当前支持的规则类型

### 通用规则
- **一般性编程规则**
- **Git相关规则**
- **Git Flow工作流规则**
- **文档编写规则**

### 编程语言
- **Python**
- **Java**
- **TypeScript**
- **Swift**
- **Go**
- **C++**

### Web框架
- **React**
- **Vue.js**
- **Next.js**
- **Tailwind CSS**

### 后端框架
- **Django**
- **Flask**
- **FastAPI**
- **Spring**

### 移动开发框架
- **Flutter**
- **SwiftUI**

## 功能特点

- 收集不同项目中的Cursor规则文件
- 对规则文件进行分类和整理
- 提供标准化的规则模板
- 便于在不同项目间共享和复用规则

## 使用方法

1. 克隆本仓库
2. 浏览相应语言和框架的规则
3. 将适用的规则应用到您的项目中
4. 贡献您自己的规则回馈社区

## 项目结构

```
cursor-rules/
├── common/              # 通用规则
│   ├── general.mdc      # 一般性编程规则
│   ├── git.mdc          # Git相关规则
│   ├── gitflow.mdc      # Git Flow工作流规则
│   └── document.mdc     # 文档编写规则
├── languages/           # 编程语言特定规则
│   ├── python.mdc       # Python语言规则
│   ├── java.mdc         # Java语言规则
│   ├── typescript.mdc   # TypeScript语言规则
│   ├── swift.mdc        # Swift语言规则
│   └── go.mdc          # Go语言规则
├── frameworks/          # 框架相关规则
│   ├── django.mdc       # Django框架规则
│   ├── flask.mdc        # Flask框架规则
│   ├── fastapi.mdc      # FastAPI框架规则
│   ├── spring.mdc       # Spring框架规则
│   ├── react.mdc        # React框架规则
│   ├── vuejs.mdc        # Vue.js框架规则
│   ├── nextjs.mdc       # Next.js框架规则
│   ├── flutter.mdc      # Flutter框架规则
│   ├── swiftui.mdc      # SwiftUI框架规则
│   └── tailwind.mdc     # Tailwind CSS规则
```

## 贡献指南

欢迎提交Pull Request来分享您的Cursor规则。请确保您的规则文件遵循项目的命名约定和结构。规则可以使用Markdown(.mdc)或JSON格式。

## 许可证

MIT
