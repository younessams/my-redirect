import { chromium } from 'playwright';
import chalk from 'chalk';
import os from 'os';
import path from 'path';

const nameToSearch = process.argv[2];

if (!nameToSearch) {
  console.log(chalk.red('❌ Khassak t3tiha smiya! (Mital: node index.js "Youssef")'));
  process.exit(1);
}

// Path dyal Google Chrome f Windows (fin m-sauvegarder l'login dyalek)
const userDataDir = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');

(async () => {
  // Wa7d l'fonction katjreb tkhdem ama f background (true) wla tban (false)
  async function runSearch(isHeadless) {
    try {
      // channel: 'chrome' = kanfrdo 3lih ykhdem b Google Chrome l'asli machi Chromium
      const context = await chromium.launchPersistentContext(userDataDir, {
        channel: 'chrome', 
        headless: isHeadless,
        slowMo: 50
      });

      const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

      console.log(chalk.cyan(`🔄 Kandakhlo l Facebook (Background: ${isHeadless})...`));
      await page.goto('https://www.facebook.com/');

      // Kanchofo wach kayn formulaire dyal login
      const isLoginForm = await page.$('[name="login"]');
      
      if (isLoginForm) {
        if (isHeadless) {
           console.log(chalk.bgRed.white(' ⚠️ Lqitak ma-loggéch f Chrome! '));
           console.log(chalk.yellow('🔄 Ghan-sdo l\'background o n7alo l\'browser 9damek bach t-logga...'));
           await context.close();
           return false; // Kanrdo false bach l'code y3raf blli khasso y3awd y7al l'browser bayn
        } else {
           console.log(chalk.yellow('👉 L\'browser m7lol. Dkhol l Facebook daba b yeddik. Kantsnaw 2 d9ay9...'));
           await page.waitForTimeout(120000);
           await context.close();
           return true; // Sali l'mohimma
        }
      }

      // Ila l9ak m-loggé aslan:
      console.log(chalk.green('✅ M-loggé! Kan9albo 3la smiya f l\'background...'));
      const searchUrl = `https://www.facebook.com/search/top?q=${encodeURIComponent(nameToSearch)}`;
      await page.goto(searchUrl);

      // Bima anana f l'background, khassna n-scrapiw chwia d results bach nbiynohom f terminal
      console.log(chalk.yellow('⏳ Kantsnaw résultats ybano...'));
      
      // Kantsnaw yban chi article wla resultat f page
      await page.waitForTimeout(5000); 

      const results = await page.$$eval('a[role="presentation"], div[role="article"] a', links => {
          return links
            .map(a => ({ text: a.innerText, link: a.href }))
            .filter(item => item.text && item.text.trim().length > 0 && item.link.includes('facebook.com'));
      });

      if(results.length > 0) {
          console.log(chalk.green('\n🎉 Nata2ij li l9it (Top 5):'));
          results.slice(0, 5).forEach((r, i) => {
              console.log(chalk.white(`[${i+1}] ${r.text.replace(/\n/g, ' - ')}`));
              console.log(chalk.gray(`🔗 ${r.link.split('?')[0]}`));
              console.log(chalk.dim('----------------------------------------'));
          });
      } else {
          console.log(chalk.yellow('⚠️ Dkhalt l page d ba7t walakin ma9drtch n-scrapi db (ymkn t7taj tbadl l\'classes).'));
      }

      await context.close();
      console.log(chalk.green('👋 Salina l\'khedma!'));
      return true; // Sali l'mohimma b naja7

    } catch (error) {
      if (error.message.includes('lock')) {
         console.log(chalk.bgRed.white('\n ❌ MOCHKIL: Google Chrome m7lol 3andek f l\'PC! '));
         console.log(chalk.yellow('💡 Khassak tsad ga3 les fenêtres dyal Chrome bmara 9bel matlanci had l\'script.'));
      } else {
         console.log(chalk.red('❌ W9a3 chi mochkil khor:'), error);
      }
      return true; // Bach myb9ach y3awd
    }
  }

  // 1. L'awal 7aja: n7awlo nkhdmo f l'background (Headless = true)
  let success = await runSearch(true);

  // 2. Ila ma-loggéch (success = false), n3awdo n7alo l'browser yban (Headless = false)
  if (!success) {
    await runSearch(false);
  }

})();