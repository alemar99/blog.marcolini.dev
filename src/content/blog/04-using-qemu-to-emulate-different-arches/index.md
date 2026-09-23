---
title: "Emulating different CPU architectures"
description: "Docker and QEMU to the rescue!"
date: "Jul 26 2026"
---

Today I stumbled upon the following problem: while doing a minor release for [MAAS](https://github.com/canonical/maas), I noticed that a snap build was failing for only one architecture: s390x.

The s390x architecture, also known as the [z/Architecture](https://en.wikipedia.org/wiki/Z/Architecture), is IBM's own 64-bit instruction set and as I soon realized, I didn't have a compatible machine at hand to reproduce the build error and eventually test my changes.

## Emulating a different architecture

After browsing the internet, I found out two possible solutions for my problem: [Docker](https://www.docker.com/) and [QEMU](https://www.qemu.org/).

### Docker

To emulate an architecture different from yours, you have to first run the following command:

```bash
docker run --privileged --rm tonistiigi/binfmt --install all
```

This will install emulators for all the architectures. You can also install a single architecture by specifying it instead of "all", e.g. in my case:

```bash
docker run --privileged --rm tonistiigi/binfmt --install s390x
```

Once you have done it, you can run containers with a different architecture by specifying the `--platform` flag:

```bash
$ docker run --rm -it --platform linux/s390x ubuntu:24.04 bash

root@cc1c98e3fe10:/# lscpu
Architecture:                s390x
[...]
```

### QEMU

In the QEMU docs, under the System Emulation section, we can find the [s390x System emulator](https://www.qemu.org/docs/master/system/target-s390x.html) page where we can find specific information about how to emulate the s390x architecture. `qemu-system-s390x` is the binary to use.

Let's first install the binary that we'll need then:

```bash
sudo apt install qemu-system-s390x
```

We will also need the image of the OS we're going to install, in my case I'll use Ubuntu (of course <3) 24.04, which I'll download from [cloud-images.ubuntu.com](https://cloud-images.ubuntu.com):

```bash
curl -O https://cloud-images.ubuntu.com/releases/noble/release-20260615/ubuntu-24.04-server-cloudimg-s390x.img
```

Since the cloud image contains the ubuntu user but no password is being set, I'm going to set it up through [cloud-init](https://github.com/canonical/cloud-init).

To do this, I will also download the `cloud-utils` since I want to use the `cloud-localds` tool.

```bash
sudo apt install cloud-utils
```

For the `cloud-init` setup, we are going to do things in the simplest possible way.
If you never used `cloud-init` before, I recommend you go reading the [New user tutorial with QEMU](https://docs.cloud-init.io/en/latest/tutorial/qemu.html) which addresses the same thing we want to achieve here.

Inside a "cloud-init" directory I create the following files:

```bash
$ ls cloud-init
meta-data  user-data
$ cat << EOF > cloud-init/user-data
#cloud-config
password: password
chpasswd:
  expire: False

EOF
$ cat << EOF > cloud-init/meta-data
instance-id: id/ubuntu-s390x

EOF
```

Now that we have all the files needed by `cloud-init`, we use the previously installed tool to create a disk for cloud-init to utilize the [NoCloud datasource](https://docs.cloud-init.io/en/latest/reference/datasources/nocloud.html#nocloud).

```bash
cloud-localds cloud-init.iso cloud-init/user-data cloud-init/meta-data
```

Finally, we can start our emulated environment with QEMU:

```bash
qemu-system-s390x \
  -m 4096 \
  -cpu max \
  -drive file=ubuntu-24.04-server-cloudimg-s390x.img,format=qcow2,if=virtio \
  -drive file=cloud-init.iso,if=virtio \
  -nographic
```

## At the end it's always QEMU

The Docker approach still relies on QEMU, but only for user-space emulation. Docker runs the s390x user-space from the image while sharing the host's kernel. When the host kernel encounters an s390x executable, the [`binfmt_misc`](https://www.kernel.org/doc/html/latest/admin-guide/binfmt-misc.html) registration starts QEMU to translate its instructions.
QEMU system emulation works at a different level. `qemu-system-s390x` emulates a complete s390x machine, including its CPU, memory, devices, and firmware environment. It boots an s390x kernel from the disk image, giving us a complete virtual machine rather than just an environment for running foreign-architecture processes.
In short:
- Docker with `binfmt`: runs foreign-architecture processes using QEMU user-mode emulation and the host kernel.
- QEMU system emulation: runs a complete foreign-architecture operating system with its own kernel.
