import { LoveLetterGamePage } from './app.po';

describe('love-letter-game App', function() {
  let page: LoveLetterGamePage;

  beforeEach(() => {
    page = new LoveLetterGamePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
