import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit {

  public heroForm = new FormGroup({
    id:               new FormControl<string>(''),
    superhero:        new FormControl<string>('', { nonNullable: true }),
    publisher:        new FormControl<Publisher>( Publisher.MarvelComics),
    alter_ego:        new FormControl(''),
    first_appearance: new FormControl(''),
    characters:       new FormControl(''),
    alt_img:          new FormControl('')
  });

  constructor(
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
    ) { }

  ngOnInit(): void {
    if(!this.router.url.includes('edit')) return;

    this.activatedRoute.params
    .pipe(
      switchMap(({id}) => this.heroesService.getHeroeById(id))
    ).subscribe(hero => {

      if(!hero) return this.router.navigate(["/heroes/list"]);

      this.heroForm.reset(hero);
      return;
    });
  }



  public publishers = [{
    id: 'DC Comics',
    value: 'DC - Comics'
  }, {
    id: 'Marvel Comics',
    value: 'Marvel - Comics'
  }];

  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero;
    return hero;
  }

  onSubmit() {

    if(this.heroForm.invalid) return;

    if(this.currentHero.id) {
      this.heroesService.updateHero(this.currentHero)
      .subscribe(hero => {
        this.showSnackbar(`${hero.superhero} updated!`);
      });
      return;
    }

    this.heroesService.addHero(this.currentHero)
      .subscribe(hero => {
        this.router.navigate(['/heroes/edit', hero.id]);
        this.showSnackbar(`${hero.superhero} created!`);
      });

  }

  onDeleteHero() {
    if(!this.currentHero.id) throw Error('Hero id is required');

    const dialog = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value
    });

    dialog.afterClosed()
      .pipe(
        filter((result:boolean) => result),
        switchMap(() => this.heroesService.deleteHeroById(this.currentHero.id!)),
        filter((wasDeleted: boolean) => wasDeleted)
      )
    .subscribe(() => {
        this.router.navigate(['/heroes/list']);
    });
  }

  showSnackbar(message: string) {
    this.snackBar.open(message, 'Ok!', {
      duration: 2500
    });
  }
}

