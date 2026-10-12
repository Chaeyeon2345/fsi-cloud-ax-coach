import {render,screen,fireEvent,within} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {describe,it,expect} from 'vitest';
import App from '../app/App';
import {cases} from '../content';
const mount=(path:string)=>render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>);
describe('working MVP flows',()=>{
 it.each(['/home','/knowledge','/timeline','/cases','/cases/jb','/knowledge/network','/quiz','/meeting','/search','/compare','/bookmarks','/about','/missing'])('renders %s without forbidden terms',path=>{const {container}=mount(path);expect(screen.getByRole('main')).toBeInTheDocument();expect(container.textContent).not.toContain('\uBA74\uC811')});
 it('filters industry and deployment independently',()=>{mount('/cases?tab=cases');const dom=cases.filter(c=>c.region==='KR');const banks=dom.filter(c=>c.industry==='은행');fireEvent.change(screen.getByLabelText('업권'),{target:{value:'은행'}});expect(screen.getByText(`${banks.length} / ${dom.length}개 사례`)).toBeInTheDocument();fireEvent.change(screen.getByLabelText('Deployment'),{target:{value:'On-premises'}});const onprem=banks.filter(c=>c.deploymentModels.includes('On-premises'));expect(screen.getByText(`${onprem.length} / ${dom.length}개 사례`)).toBeInTheDocument();expect(screen.getByRole('link',{name:'제주은행'})).toBeInTheDocument()});
 it('opens sources and safe original links',()=>{mount('/cases/jb');fireEvent.click(screen.getAllByRole('button',{name:/출처/})[0]);const dialog=screen.getByRole('dialog');const link=within(dialog).getByRole('link');expect(link).toHaveAttribute('rel','noopener noreferrer');expect(link).toHaveAttribute('href','https://www.megazone.com/resources/newsroom/89');fireEvent.click(screen.getByLabelText('출처 닫기'));expect(dialog).not.toHaveAttribute('open')});
 it('reveals quiz explanations then persists review',()=>{mount('/quiz?id=q1');fireEvent.click(screen.getByRole('button',{name:/2대상 업무 선정과 중요도 평가|2 대상 업무 선정과 중요도 평가/}));expect(screen.getByText('정답입니다')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'확실'}));expect(localStorage.getItem('fsi-coach:v1')).toContain('q1')});
 it('reveals Meeting answers and marks practice',()=>{mount('/meeting?id=m3');fireEvent.click(screen.getByRole('button',{name:'핵심 키워드·답변 보기'}));expect(screen.getByRole('heading',{name:'60초 답변'})).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'연습 완료 표시'}));expect(localStorage.getItem('fsi-coach:v1')).toContain('m3')});
 it('bookmarks a case',()=>{mount('/cases/jb');fireEvent.click(screen.getByRole('button',{name:'☆ 북마크'}));expect(screen.getByRole('button',{name:'★ 저장됨'})).toHaveAttribute('aria-pressed','true')});
});
describe('phase 2: curriculum, meeting modes, quiz modes',()=>{
 it.each(['/learn','/learn/curriculum/1','/learn/curriculum/7','/meeting/quick','/meeting/customer','/meeting/deep-dive','/meeting/account-manager','/quiz/daily','/quiz/review','/quiz/weakness'])('renders %s without forbidden terms',path=>{const {container}=mount(path);expect(screen.getByRole('main')).toBeInTheDocument();expect(container.textContent).not.toContain('\uBA74\uC811')});
 it('shows sixteen curriculum days',()=>{mount('/learn');expect(screen.getAllByRole('row')).toHaveLength(17)});
 it('limits meeting questions to the selected mode',()=>{mount('/meeting/quick');expect(within(screen.getByRole('navigation',{name:'미팅 질문 목록'})).getAllByRole('button')).toHaveLength(5)});
 it('daily quiz serves five unseen questions',()=>{mount('/quiz/daily');expect(screen.getByText('1 / 5')).toBeInTheDocument()});
 it('unknown curriculum day is not found',()=>{mount('/learn/curriculum/17');expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument()});
});
