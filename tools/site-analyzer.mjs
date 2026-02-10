/**
 * Playwright Site Analyzer — Scroll Effect Documentation
 * Captures screenshots at scroll intervals and documents DOM structure,
 * CSS animations, transforms, and scroll-driven effects.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SITES = [
  { name: 'clickerss', url: 'https://www.clickerss.com/' },
  { name: 'facetad', url: 'https://www.facetad.com/' },
  { name: 'wix-template-3630', url: 'https://www.wix.com/website-template/view/html/3630' },
  { name: 'tableside', url: 'https://www.tableside.com.au/' },
  { name: 'wix-studio-space', url: 'https://www.wix.com/studio/design/inspiration/space' },
  { name: 'simone-webflow', url: 'https://weare-simone.webflow.io/' },
];

const OUT_DIR = join(process.cwd(), 'tools', 'site-analysis');
mkdirSync(OUT_DIR, { recursive: true });

// Analysis script injected into each page
const ANALYSIS_SCRIPT = `
(() => {
  const results = {
    totalHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
    scrollRatio: document.documentElement.scrollHeight / window.innerHeight,
    sections: [],
    animations: [],
    stickyElements: [],
    parallaxCandidates: [],
    clipPathElements: [],
    transformElements: [],
    opacityTransitions: [],
    scaleElements: [],
    blendModes: [],
    gradients: [],
    videoElements: [],
    canvasElements: [],
    svgAnimations: [],
    typographyEffects: [],
    interactiveElements: [],
    fixedElements: [],
  };

  const allElements = document.querySelectorAll('*');

  allElements.forEach((el, i) => {
    if (i > 3000) return; // Cap for performance
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    // Skip invisible/tiny elements
    if (rect.width < 10 || rect.height < 10) return;

    const tag = el.tagName.toLowerCase();
    const classes = el.className && typeof el.className === 'string' ? el.className.substring(0, 120) : '';
    const id = el.id ? el.id.substring(0, 60) : '';
    const identifier = id || classes.split(' ')[0] || tag;

    // Sticky/Fixed positioning
    if (cs.position === 'sticky') {
      results.stickyElements.push({
        el: identifier, tag, top: cs.top,
        y: Math.round(rect.top), h: Math.round(rect.height),
      });
    }
    if (cs.position === 'fixed') {
      results.fixedElements.push({
        el: identifier, tag,
        y: Math.round(rect.top), h: Math.round(rect.height),
        zIndex: cs.zIndex,
      });
    }

    // Transform detection
    if (cs.transform && cs.transform !== 'none') {
      results.transformElements.push({
        el: identifier, tag,
        transform: cs.transform.substring(0, 200),
        willChange: cs.willChange,
        y: Math.round(rect.top),
      });
    }

    // Clip-path detection
    if (cs.clipPath && cs.clipPath !== 'none') {
      results.clipPathElements.push({
        el: identifier, tag,
        clipPath: cs.clipPath.substring(0, 200),
        y: Math.round(rect.top),
      });
    }

    // Opacity (not fully opaque)
    if (cs.opacity !== '1' && cs.opacity !== '') {
      results.opacityTransitions.push({
        el: identifier, opacity: cs.opacity,
        y: Math.round(rect.top),
      });
    }

    // Scale transforms
    if (cs.transform && (cs.transform.includes('scale') || cs.transform.includes('matrix'))) {
      results.scaleElements.push({
        el: identifier,
        transform: cs.transform.substring(0, 150),
        y: Math.round(rect.top),
      });
    }

    // Blend modes
    if (cs.mixBlendMode && cs.mixBlendMode !== 'normal') {
      results.blendModes.push({
        el: identifier, mode: cs.mixBlendMode,
        y: Math.round(rect.top),
      });
    }

    // Gradients in background
    if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
      results.gradients.push({
        el: identifier,
        gradient: cs.backgroundImage.substring(0, 300),
        y: Math.round(rect.top),
      });
    }

    // CSS animations
    if (cs.animationName && cs.animationName !== 'none') {
      results.animations.push({
        el: identifier,
        name: cs.animationName,
        duration: cs.animationDuration,
        timing: cs.animationTimingFunction,
        delay: cs.animationDelay,
        iteration: cs.animationIterationCount,
        y: Math.round(rect.top),
      });
    }

    // CSS transitions
    if (cs.transition && cs.transition !== 'all 0s ease 0s' && cs.transition !== 'none 0s ease 0s') {
      results.interactiveElements.push({
        el: identifier,
        transition: cs.transition.substring(0, 200),
        cursor: cs.cursor,
        y: Math.round(rect.top),
      });
    }

    // Video elements
    if (tag === 'video') {
      results.videoElements.push({
        el: identifier,
        src: (el.src || el.querySelector('source')?.src || '').substring(0, 200),
        autoplay: el.autoplay, loop: el.loop, muted: el.muted,
        w: Math.round(rect.width), h: Math.round(rect.height),
        y: Math.round(rect.top),
      });
    }

    // Canvas elements
    if (tag === 'canvas') {
      results.canvasElements.push({
        el: identifier,
        w: el.width, h: el.height,
        cssW: Math.round(rect.width), cssH: Math.round(rect.height),
        y: Math.round(rect.top),
      });
    }

    // SVG elements
    if (tag === 'svg' && rect.height > 30) {
      results.svgAnimations.push({
        el: identifier,
        w: Math.round(rect.width), h: Math.round(rect.height),
        y: Math.round(rect.top),
        childCount: el.children.length,
      });
    }

    // Parallax candidates (elements with translateY or will-change: transform in scrollable context)
    if (cs.willChange === 'transform' || cs.willChange === 'scroll-position' ||
        (cs.transform && cs.transform !== 'none' && cs.position !== 'fixed')) {
      if (!results.parallaxCandidates.find(p => p.el === identifier)) {
        results.parallaxCandidates.push({
          el: identifier, tag,
          transform: (cs.transform || '').substring(0, 150),
          willChange: cs.willChange,
          y: Math.round(rect.top),
          h: Math.round(rect.height),
        });
      }
    }

    // Large sections
    if (rect.height > window.innerHeight * 0.5 &&
        ['section', 'div', 'main', 'article'].includes(tag)) {
      if (classes || id) {
        results.sections.push({
          el: identifier, tag,
          y: Math.round(rect.top),
          h: Math.round(rect.height),
          vh: (rect.height / window.innerHeight).toFixed(1),
          bg: cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : null,
          overflow: cs.overflow,
          position: cs.position,
        });
      }
    }
  });

  return results;
})()
`;

// Script to detect element changes during scroll
const SCROLL_DIFF_SCRIPT = `
((scrollY) => {
  const snapshot = [];
  const allElements = document.querySelectorAll('*');
  let count = 0;

  allElements.forEach((el) => {
    if (count > 1500) return;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;

    const tag = el.tagName.toLowerCase();
    const classes = el.className && typeof el.className === 'string' ? el.className.substring(0, 80) : '';
    const id = el.id ? el.id.substring(0, 40) : '';
    const identifier = id || classes.split(' ')[0] || tag;

    // Only track elements with interesting properties
    if (cs.transform !== 'none' || cs.opacity !== '1' ||
        cs.position === 'sticky' || cs.position === 'fixed' ||
        (cs.clipPath && cs.clipPath !== 'none')) {
      snapshot.push({
        id: identifier,
        transform: cs.transform !== 'none' ? cs.transform.substring(0, 100) : null,
        opacity: cs.opacity !== '1' ? cs.opacity : null,
        clipPath: cs.clipPath !== 'none' ? cs.clipPath?.substring(0, 100) : null,
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        visible: rect.top < window.innerHeight && rect.bottom > 0,
      });
      count++;
    }
  });

  return { scrollY, snapshot };
})(window.scrollY)
`;

async function analyzeSite(browser, site) {
  console.log(`\\n${'='.repeat(60)}`);
  console.log(`ANALYZING: ${site.name} (${site.url})`);
  console.log('='.repeat(60));

  const siteDir = join(OUT_DIR, site.name);
  mkdirSync(siteDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    // Navigate with generous timeout
    await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
    // Wait for JS animations to initialize
    await page.waitForTimeout(3000);

    // Take initial screenshot
    await page.screenshot({ path: join(siteDir, '00-top.png'), fullPage: false });

    // Run initial analysis at top of page
    const initialAnalysis = await page.evaluate(ANALYSIS_SCRIPT);
    console.log(`  Page height: ${initialAnalysis.totalHeight}px (${initialAnalysis.scrollRatio.toFixed(1)}x viewport)`);
    console.log(`  Sections: ${initialAnalysis.sections.length}`);
    console.log(`  Animations: ${initialAnalysis.animations.length}`);
    console.log(`  Transform elements: ${initialAnalysis.transformElements.length}`);
    console.log(`  Parallax candidates: ${initialAnalysis.parallaxCandidates.length}`);
    console.log(`  Clip-path elements: ${initialAnalysis.clipPathElements.length}`);
    console.log(`  Sticky elements: ${initialAnalysis.stickyElements.length}`);
    console.log(`  Videos: ${initialAnalysis.videoElements.length}`);
    console.log(`  Canvas: ${initialAnalysis.canvasElements.length}`);
    console.log(`  SVGs: ${initialAnalysis.svgAnimations.length}`);
    console.log(`  Gradients: ${initialAnalysis.gradients.length}`);
    console.log(`  Blend modes: ${initialAnalysis.blendModes.length}`);

    // Scroll through the page in increments, capturing snapshots
    const totalHeight = initialAnalysis.totalHeight;
    const viewportH = initialAnalysis.viewportHeight;
    const scrollSteps = Math.min(25, Math.ceil(totalHeight / (viewportH * 0.5)));
    const stepSize = totalHeight / scrollSteps;

    const scrollSnapshots = [];

    for (let i = 0; i <= scrollSteps; i++) {
      const scrollTo = Math.min(i * stepSize, totalHeight - viewportH);

      // Use wheel events to trigger Lenis/GSAP scroll (window.scrollTo won't trigger them)
      const currentY = await page.evaluate(() => window.scrollY || window.pageYOffset);
      const delta = scrollTo - currentY;
      const wheelSteps = Math.max(1, Math.ceil(Math.abs(delta) / 400));
      const perStep = delta / wheelSteps;
      for (let w = 0; w < wheelSteps; w++) {
        await page.mouse.wheel(0, perStep);
        await page.waitForTimeout(40);
      }
      await page.waitForTimeout(800); // Let Lenis lerp + animations settle

      // Capture screenshot
      const screenshotName = `scroll-${String(i).padStart(2, '0')}-${Math.round(scrollTo)}px.png`;
      await page.screenshot({ path: join(siteDir, screenshotName), fullPage: false });

      // Capture element state at this scroll position
      const snapshot = await page.evaluate(SCROLL_DIFF_SCRIPT);
      scrollSnapshots.push(snapshot);
    }

    // Analyze scroll-driven changes
    const scrollEffects = analyzeScrollChanges(scrollSnapshots);

    // Combine all data
    const report = {
      site: site.name,
      url: site.url,
      pageMetrics: {
        totalHeight: totalHeight,
        viewportHeight: viewportH,
        scrollRatio: (totalHeight / viewportH).toFixed(1),
        scrollSteps: scrollSteps,
      },
      initialAnalysis,
      scrollEffects,
      screenshotCount: scrollSteps + 1,
    };

    // Write JSON report
    writeFileSync(
      join(siteDir, 'analysis.json'),
      JSON.stringify(report, null, 2)
    );

    console.log(`  Scroll effects detected: ${scrollEffects.length}`);
    console.log(`  Screenshots: ${scrollSteps + 1}`);
    console.log(`  Report saved: ${siteDir}/analysis.json`);

    return report;

  } catch (err) {
    console.error(`  ERROR analyzing ${site.name}: ${err.message}`);
    return { site: site.name, url: site.url, error: err.message };
  } finally {
    await context.close();
  }
}

function analyzeScrollChanges(snapshots) {
  const effects = [];

  if (snapshots.length < 2) return effects;

  // Track elements across scroll positions
  const elementHistory = new Map();

  snapshots.forEach((snap, snapIdx) => {
    snap.snapshot.forEach((el) => {
      if (!elementHistory.has(el.id)) {
        elementHistory.set(el.id, []);
      }
      elementHistory.get(el.id).push({
        scrollY: snap.scrollY,
        snapIdx,
        ...el,
      });
    });
  });

  // Detect scroll-driven effects
  elementHistory.forEach((history, elId) => {
    if (history.length < 3) return;

    // Detect parallax (position changes at different rate than scroll)
    const topDeltas = [];
    for (let i = 1; i < history.length; i++) {
      const scrollDelta = history[i].scrollY - history[i-1].scrollY;
      const topDelta = history[i].top - history[i-1].top;
      if (scrollDelta > 0) {
        topDeltas.push({
          ratio: topDelta / -scrollDelta,
          scrollY: history[i].scrollY,
        });
      }
    }

    if (topDeltas.length > 2) {
      const avgRatio = topDeltas.reduce((a, b) => a + b.ratio, 0) / topDeltas.length;
      if (Math.abs(avgRatio - 1) > 0.1 && Math.abs(avgRatio) < 5) {
        effects.push({
          type: 'parallax',
          element: elId,
          speedRatio: avgRatio.toFixed(2),
          direction: avgRatio > 1 ? 'faster-than-scroll' : avgRatio > 0 ? 'slower-than-scroll' : 'reverse',
        });
      }
    }

    // Detect opacity transitions
    const opacityChanges = history.filter(h => h.opacity !== null);
    if (opacityChanges.length > 1) {
      const opacities = opacityChanges.map(h => parseFloat(h.opacity));
      const min = Math.min(...opacities);
      const max = Math.max(...opacities);
      if (max - min > 0.2) {
        effects.push({
          type: 'opacity-transition',
          element: elId,
          range: `${min.toFixed(2)} → ${max.toFixed(2)}`,
          startScroll: opacityChanges[0].scrollY,
          endScroll: opacityChanges[opacityChanges.length - 1].scrollY,
        });
      }
    }

    // Detect transform changes (scale, rotation)
    const transformChanges = history.filter(h => h.transform !== null);
    if (transformChanges.length > 1) {
      const unique = new Set(transformChanges.map(h => h.transform));
      if (unique.size > 2) {
        effects.push({
          type: 'transform-animation',
          element: elId,
          sampleCount: unique.size,
          firstTransform: transformChanges[0].transform,
          lastTransform: transformChanges[transformChanges.length - 1].transform,
        });
      }
    }

    // Detect clip-path changes
    const clipChanges = history.filter(h => h.clipPath !== null);
    if (clipChanges.length > 1) {
      const unique = new Set(clipChanges.map(h => h.clipPath));
      if (unique.size > 1) {
        effects.push({
          type: 'clip-path-morph',
          element: elId,
          first: clipChanges[0].clipPath,
          last: clipChanges[clipChanges.length - 1].clipPath,
        });
      }
    }

    // Detect size changes (scale effects)
    const sizeChanges = history.filter(h => h.visible);
    if (sizeChanges.length > 3) {
      const widths = sizeChanges.map(h => h.width);
      const heights = sizeChanges.map(h => h.height);
      const widthRange = Math.max(...widths) - Math.min(...widths);
      const heightRange = Math.max(...heights) - Math.min(...heights);
      if (widthRange > 50 || heightRange > 50) {
        effects.push({
          type: 'size-morph',
          element: elId,
          widthRange: `${Math.min(...widths)} → ${Math.max(...widths)}`,
          heightRange: `${Math.min(...heights)} → ${Math.max(...heights)}`,
        });
      }
    }
  });

  return effects;
}

// Summarize a single site report into markdown
function summarizeSite(report) {
  if (report.error) {
    return `### ${report.site} (${report.url})\n\n**ERROR**: ${report.error}\n\n`;
  }

  const a = report.initialAnalysis;
  let md = '';

  md += `### ${report.site} (${report.url})\n\n`;
  md += `**Page Metrics**: ${a.totalHeight}px total (${report.pageMetrics.scrollRatio}x viewport), ${a.sections.length} sections\n\n`;

  // Sections
  if (a.sections.length > 0) {
    md += `#### Layout Sections\n`;
    a.sections.forEach(s => {
      md += `- **${s.el}** (${s.tag}): ${s.h}px (${s.vh}vh) at y=${s.y}, pos=${s.position}`;
      if (s.bg) md += `, bg=${s.bg}`;
      md += `\n`;
    });
    md += '\n';
  }

  // Animations
  if (a.animations.length > 0) {
    md += `#### CSS Animations (${a.animations.length})\n`;
    a.animations.forEach(an => {
      md += `- **${an.el}**: \`${an.name}\` ${an.duration} ${an.timing} (iter: ${an.iteration})\n`;
    });
    md += '\n';
  }

  // Transforms
  if (a.transformElements.length > 0) {
    md += `#### Transform Elements (${a.transformElements.length})\n`;
    a.transformElements.slice(0, 20).forEach(t => {
      md += `- **${t.el}**: \`${t.transform}\``;
      if (t.willChange !== 'auto') md += ` (will-change: ${t.willChange})`;
      md += `\n`;
    });
    if (a.transformElements.length > 20) md += `- ... and ${a.transformElements.length - 20} more\n`;
    md += '\n';
  }

  // Parallax candidates
  if (a.parallaxCandidates.length > 0) {
    md += `#### Parallax Candidates (${a.parallaxCandidates.length})\n`;
    a.parallaxCandidates.slice(0, 15).forEach(p => {
      md += `- **${p.el}**: ${p.transform || 'no transform'} (will-change: ${p.willChange}), h=${p.h}px\n`;
    });
    md += '\n';
  }

  // Clip-paths
  if (a.clipPathElements.length > 0) {
    md += `#### Clip-Path Elements (${a.clipPathElements.length})\n`;
    a.clipPathElements.forEach(c => {
      md += `- **${c.el}**: \`${c.clipPath}\`\n`;
    });
    md += '\n';
  }

  // Sticky/Fixed
  if (a.stickyElements.length > 0) {
    md += `#### Sticky Elements (${a.stickyElements.length})\n`;
    a.stickyElements.forEach(s => {
      md += `- **${s.el}** (${s.tag}): top=${s.top}, h=${s.h}px\n`;
    });
    md += '\n';
  }

  if (a.fixedElements.length > 0) {
    md += `#### Fixed Elements (${a.fixedElements.length})\n`;
    a.fixedElements.forEach(f => {
      md += `- **${f.el}** (${f.tag}): z=${f.zIndex}, h=${f.h}px\n`;
    });
    md += '\n';
  }

  // Blend modes
  if (a.blendModes.length > 0) {
    md += `#### Blend Modes\n`;
    a.blendModes.forEach(b => {
      md += `- **${b.el}**: \`${b.mode}\`\n`;
    });
    md += '\n';
  }

  // Gradients
  if (a.gradients.length > 0) {
    md += `#### Gradients (${a.gradients.length})\n`;
    a.gradients.slice(0, 10).forEach(g => {
      md += `- **${g.el}**: \`${g.gradient.substring(0, 120)}...\`\n`;
    });
    md += '\n';
  }

  // Videos / Canvas / SVG
  if (a.videoElements.length > 0) {
    md += `#### Video Elements (${a.videoElements.length})\n`;
    a.videoElements.forEach(v => {
      md += `- **${v.el}**: ${v.w}x${v.h}, autoplay=${v.autoplay}, loop=${v.loop}\n`;
    });
    md += '\n';
  }
  if (a.canvasElements.length > 0) {
    md += `#### Canvas Elements (${a.canvasElements.length})\n`;
    a.canvasElements.forEach(c => {
      md += `- **${c.el}**: ${c.w}x${c.h} (CSS: ${c.cssW}x${c.cssH})\n`;
    });
    md += '\n';
  }

  // Scroll-driven effects
  if (report.scrollEffects.length > 0) {
    md += `#### Scroll-Driven Effects (${report.scrollEffects.length})\n`;

    const byType = {};
    report.scrollEffects.forEach(e => {
      if (!byType[e.type]) byType[e.type] = [];
      byType[e.type].push(e);
    });

    Object.entries(byType).forEach(([type, effects]) => {
      md += `\n**${type}** (${effects.length}):\n`;
      effects.slice(0, 8).forEach(e => {
        if (type === 'parallax') {
          md += `- \`${e.element}\`: speed ratio ${e.speedRatio} (${e.direction})\n`;
        } else if (type === 'opacity-transition') {
          md += `- \`${e.element}\`: ${e.range} (scroll ${e.startScroll}→${e.endScroll})\n`;
        } else if (type === 'transform-animation') {
          md += `- \`${e.element}\`: ${e.sampleCount} unique transforms\n`;
        } else if (type === 'clip-path-morph') {
          md += `- \`${e.element}\`: \`${e.first}\` → \`${e.last}\`\n`;
        } else if (type === 'size-morph') {
          md += `- \`${e.element}\`: w=${e.widthRange}, h=${e.heightRange}\n`;
        }
      });
    });
    md += '\n';
  }

  // Interactive elements summary
  if (a.interactiveElements.length > 0) {
    md += `#### Interactive Elements (${a.interactiveElements.length})\n`;
    const cursors = {};
    a.interactiveElements.forEach(el => {
      const c = el.cursor || 'default';
      cursors[c] = (cursors[c] || 0) + 1;
    });
    Object.entries(cursors).forEach(([cursor, count]) => {
      md += `- cursor: ${cursor} (${count} elements)\n`;
    });
    md += '\n';
  }

  md += '---\n\n';
  return md;
}

// Local proxy forwarder that handles authenticated upstream proxy
function startLocalProxy() {
  return new Promise((resolve) => {
    const http = require('http');
    const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
    if (!proxyUrl) { resolve({ port: 0, close() {} }); return; }
    const url = new URL(proxyUrl);
    const AUTH = 'Basic ' + Buffer.from(
      decodeURIComponent(url.username) + ':' + decodeURIComponent(url.password)
    ).toString('base64');

    const server = http.createServer((req, res) => {
      const opts = {
        host: url.hostname, port: parseInt(url.port),
        method: req.method, path: req.url,
        headers: { ...req.headers, 'Proxy-Authorization': AUTH },
      };
      const upstream = http.request(opts, (upRes) => {
        res.writeHead(upRes.statusCode, upRes.headers);
        upRes.pipe(res);
      });
      upstream.on('error', (e) => res.end('Error: ' + e.message));
      req.pipe(upstream);
    });

    server.on('connect', (req, cltSocket, head) => {
      const connectReq = http.request({
        host: url.hostname, port: parseInt(url.port),
        method: 'CONNECT', path: req.url,
        headers: { 'Host': req.url, 'Proxy-Authorization': AUTH },
      });
      connectReq.on('connect', (res, srvSocket) => {
        cltSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        srvSocket.write(head);
        srvSocket.pipe(cltSocket);
        cltSocket.pipe(srvSocket);
      });
      connectReq.on('error', () => {
        cltSocket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
        cltSocket.end();
      });
      connectReq.end();
    });

    server.listen(0, '127.0.0.1', () => {
      resolve({ port: server.address().port, close() { server.close(); } });
    });
  });
}

async function main() {
  console.log('VIB3+ Site Analyzer — Scroll Effect Documentation');
  console.log('Launching Chromium...');

  // Parse proxy from environment for Chromium
  const proxyConfig = (() => {
    const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
    if (!proxyUrl) return {};
    try {
      const url = new URL(proxyUrl);
      return {
        proxy: {
          server: `${url.protocol}//${url.hostname}:${url.port}`,
          username: decodeURIComponent(url.username),
          password: decodeURIComponent(url.password),
        },
      };
    } catch {
      return {};
    }
  })();

  if (proxyConfig.proxy) {
    console.log(`Using proxy: ${proxyConfig.proxy.server} (authenticated)`);
  }

  // Start a local proxy forwarder to handle auth (Chromium can't do long JWT auth)
  const localProxy = await startLocalProxy();
  console.log(`Local proxy forwarder on port ${localProxy.port}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors',
      '--disable-gpu', '--disable-dev-shm-usage', '--single-process',
    ],
    proxy: { server: `http://127.0.0.1:${localProxy.port}` },
  });

  const reports = [];

  for (const site of SITES) {
    try {
      const report = await analyzeSite(browser, site);
      reports.push(report);
    } catch (err) {
      console.error(`Failed to analyze ${site.name}: ${err.message}`);
      reports.push({ site: site.name, url: site.url, error: err.message });
    }
  }

  await browser.close();
  localProxy.close();

  // Generate combined markdown report
  let combinedMd = '# Reference Site Scroll Analysis\n\n';
  combinedMd += `*Generated: ${new Date().toISOString()}*\n\n`;
  combinedMd += `Analyzed ${reports.length} sites for scroll effects, parallax, morphing, depth illusions, and multi-element coordination.\n\n`;
  combinedMd += '---\n\n';

  reports.forEach(report => {
    combinedMd += summarizeSite(report);
  });

  writeFileSync(join(OUT_DIR, 'combined-analysis.md'), combinedMd);

  // Also write structured JSON for all reports
  writeFileSync(
    join(OUT_DIR, 'all-reports.json'),
    JSON.stringify(reports, null, 2)
  );

  console.log(`\\n${'='.repeat(60)}`);
  console.log('ANALYSIS COMPLETE');
  console.log(`Reports: ${join(OUT_DIR, 'combined-analysis.md')}`);
  console.log(`JSON: ${join(OUT_DIR, 'all-reports.json')}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
