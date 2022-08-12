import {TestBed} from '@angular/core/testing';
import {CoursesService} from './courses.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {COURSES, findLessonsForCourse} from '../../../../server/db-data';
import {Course} from '../model/course';
import {HttpErrorResponse} from '@angular/common/http';

describe('CoursesService', () => {
  let coursesService: CoursesService,
    httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CoursesService
      ]
    });
    coursesService = TestBed.inject(CoursesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });
  it('should retrieve all courses',  () => {

  });
  it('should find a course by id',  () => {
    coursesService.findCourseById(12)
      .subscribe(course => {
        expect(course).toBeTruthy();
        expect(course.id).toBe(12);
      });
    const req = httpTestingController.expectOne('/api/courses/12');
    expect(req.request.method).toEqual('GET');
    req.flush(COURSES[12]);
  });
  it('should save the course data',  () => {
    const changes: Partial<Course> = {titles: {description: 'Anis Testing'}};
    coursesService.saveCourse(12, changes)
      .subscribe(course => {
        expect(course.id).toBe(12);
      });
    const req = httpTestingController.expectOne('/api/courses/12');
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body.titles.description).toEqual(changes.titles.description);
    req.flush({
      ...COURSES[12],
      ...changes
    }, {status: 200, statusText: 'OK'});
  });
  afterEach(()  => {
    httpTestingController.verify();
  });
  it('should give an error if save course fails',  () => {
    const changes: Partial<Course> = {titles: {description: 'Anis Testing'}};
    coursesService.saveCourse(12, changes)
      .subscribe(
        () =>   fail('the save course operation should have failed'),
        (errorResponse: HttpErrorResponse) => {
          expect(errorResponse.status).toBe(500);
        }
      );
    const req = httpTestingController.expectOne('/api/courses/12');
    expect(req.request.method).toEqual('PUT');
    req.flush('Save course failed', {status: 500, statusText: 'Internal Server Error'});
  });
  it('should find list of lessons',  () => {
    coursesService.findLessons(12)
      .subscribe(lessons => {
        expect(lessons).toBeTruthy();
        expect(lessons.length).toBe(3);
      });
    const req = httpTestingController.expectOne(
      request => request.url === '/api/lessons');
    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('courseId')).toEqual('12');
    expect(req.request.params.get('filter')).toEqual('');
    expect(req.request.params.get('sortOrder')).toEqual('asc');
    expect(req.request.params.get('pageNumber')).toEqual('0');
    expect(req.request.params.get('pageSize')).toEqual('3');
    req.flush({
      payload: findLessonsForCourse(12).slice(0, 3)
    });
  });
  afterEach(()  => {
    httpTestingController.verify();
  });
});
