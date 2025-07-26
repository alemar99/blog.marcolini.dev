---
title: "Simplifying Local Development of Snap and Deb Packages with OverlayFS"
description: "A tool for mounting local source code changes over installed packages without rebuilding"
date: "Jul 26 2025"
---

When developing applications that are distributed as snap or deb packages, testing local changes becomes a real pain. You write some code, then you have to rebuild the entire package, reinstall it, and only then can you see if your changes work. This cycle can take several minutes, making development incredibly slow.

I got tired of this workflow and built a simple Python script that uses OverlayFS to mount your local source files directly over the installed package files. No rebuilding, no reinstalling—just instant feedback.


## OverlayFS

[OverlayFS](https://en.wikipedia.org/wiki/OverlayFS) is a union mount filesystem included in the Linux kernel that allows multiple directories to be combined into a single view. It works by layering a "upper" directory (containing changes) over a "lower" directory (the original files), presenting a unified filesystem where modifications in the upper layer take precedence.

Here's how it works for our use case:
- Lower layer: Your installed package files (the original)
- Upper layer: Your local source code (with your changes)
- Result: The system sees your local changes without touching the original package

The [Linux kernel documentation](https://docs.kernel.org/filesystems/overlayfs.html) has all the technical details if you want to dive deeper.

## Configuration Structure

The overlay mount tool uses a simple YAML configuration file to define package mappings:

```yaml
snap:
  package: "your-snap-name"
  dirs:
    src/python-module: /snap/your-snap-name/current/lib/python3.12/site-packages/module
    src/web-assets: /snap/your-snap-name/current/usr/share/app/static
  files:
    src/binary/app: /snap/your-snap-name/current/usr/bin/app
    src/config/settings.conf: /snap/your-snap-name/current/etc/app/settings.conf

deb:
  package: "your-deb-package"
  dirs:
    src/python-module: /usr/lib/python3/dist-packages/module
    src/web-assets: /usr/share/app/static
  files:
    src/binary/app: /usr/bin/app
    src/config/settings.conf: /etc/app/settings.conf
```

The structure is straightforward:

- **package**: The name of the snap or deb package to overlay
- **dirs**: Directory mappings where OverlayFS unions are created
- **files**: Individual file mappings using read-only bind mounts

## Usage

The script supports two commands:

```bash
# Mount local changes over snap package
./overlay-mount.py sync --snap

# Remove overlays and restore original package files  
./overlay-mount.py unsync --deb

# Preview operations without executing
./overlay-mount.py sync --snap --dry-run
```

That's it. No complex setup, no package rebuilding. Once you defined the mappings from your local source code to snap/deb file locations, you're done.

The complete implementation is available on GitHub, with an example of how I use it for MAAS: [https://github.com/alemar99/overlay-mount-tool](https://github.com/alemar99/overlay-mount-tool)
